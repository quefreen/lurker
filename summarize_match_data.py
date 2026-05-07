"""
summarize_match_data.py
------------------------
Converte os JSONs brutos do HLTV (team bundle) e da Pinnacle (odds)
em um único JSON de resumo analítico para o Claude Code.

Uso:
    python summarize_match_data.py \
        --team_a team_a_bundle.json \
        --team_b team_b_bundle.json \
        --odds   odds.json \
        --output resumo.json \
        [--last_n 20]

Novidades v4.1:
    - Correção do hltv_team_map_performance: leitura do bloco `_raw` e limpeza no nome dos mapas
    - Melhoria na conversão de porcentagens em strings para floats numéricos
"""

import json
import argparse
import re
import os
from collections import defaultdict
from datetime import datetime


# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_score(score_str: str):
    m = re.match(r"^(\d+)-(\d+)$", str(score_str).strip())
    if not m:
        return None
    return int(m.group(1)), int(m.group(2))

def extract_nickname(full_name: str) -> str:
    m = re.search(r"'([^']+)'", full_name)
    return m.group(1) if m else full_name

def safe_float(val):
    if val is None:
        return None
    if isinstance(val, str):
        # Remove símbolos de porcentagem para evitar erro de conversão
        val = val.replace("%", "").strip()
    try:
        return float(val)
    except (TypeError, ValueError):
        return None

def safe_round(val, digits=3):
    f = safe_float(val)
    return round(f, digits) if f is not None else None

def parse_date(date_str: str):
    if not date_str:
        return None
    cleaned = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", date_str.strip())
    for fmt in ("%d of %B %Y", "%B %d, %Y", "%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(cleaned, fmt)
        except ValueError:
            continue
    return None

def recency_weight(match_date: datetime, newest_date: datetime, oldest_date: datetime) -> float:
    if newest_date == oldest_date:
        return 1.0
    span = (newest_date - oldest_date).days
    age = (newest_date - match_date).days
    ratio = age / span if span > 0 else 0
    return round(1.0 - 0.5 * ratio, 4)

def parse_halves(half_raw: str):
    if not half_raw:
        return []
    halves = []
    for part in half_raw.split(";"):
        part = part.strip()
        m = re.match(r"(\d+):(\d+)", part)
        if m:
            halves.append((int(m.group(1)), int(m.group(2))))
    return halves


# ── Processamento do bundle de time ───────────────────────────────────────────

def process_team_bundle(bundle: dict, team_name: str, last_n: int = 20) -> dict:

    # 1. Partidas recentes
    matches_meta = bundle.get("matches_meta", [])[:last_n]
    match_ids = {str(m["match_id"]) for m in matches_meta}

    match_dates = {}
    for m in matches_meta:
        dt = parse_date(m.get("date", ""))
        match_dates[str(m["match_id"])] = dt

    valid_dates = [d for d in match_dates.values() if d is not None]
    newest = max(valid_dates) if valid_dates else None
    oldest = min(valid_dates) if valid_dates else None

    match_weights = {}
    for mid, dt in match_dates.items():
        if dt and newest and oldest:
            match_weights[mid] = recency_weight(dt, newest, oldest)
        else:
            match_weights[mid] = 1.0

    # 2. Win rate e forma
    wins = sum(
        1 for m in matches_meta
        if (m.get("team_1") == team_name and (m.get("score_1") or 0) > (m.get("score_2") or 0))
        or (m.get("team_2") == team_name and (m.get("score_2") or 0) > (m.get("score_1") or 0))
    )
    recent_wr = round(wins / len(matches_meta), 3) if matches_meta else None

    recent_form = []
    for m in matches_meta[:5]:
        won = (
            (m.get("team_1") == team_name and (m.get("score_1") or 0) > (m.get("score_2") or 0))
            or (m.get("team_2") == team_name and (m.get("score_2") or 0) > (m.get("score_1") or 0))
        )
        recent_form.append("W" if won else "L")
    recent_form_str = "".join(recent_form)

    # 3. Stats globais por mapa (com fallbacks para _raw e limpeza do nome)
    map_global = {}
    for mp in bundle.get("hltv_team_map_performance", []):
        raw_map_name = mp.get("map_name", "Unknown")
        # Remove a porcentagem que vem grudada no nome (ex: "Dust2 - 58.9%" -> "Dust2")
        map_name = raw_map_name.split(" - ")[0].strip()

        wins_g = mp.get("wins")
        losses_g = mp.get("losses")
        total = (wins_g or 0) + (losses_g or 0)
        
        raw_data = mp.get("_raw", {})

        # Função interna para pegar da raiz, ou buscar no _raw se for nulo
        def get_stat(key, raw_key):
            val = mp.get(key)
            if val is None and raw_key in raw_data:
                return raw_data[raw_key]
            return val

        map_global[map_name] = {
            "games_total": total or safe_float(raw_data.get("Times played", mp.get("times_played"))),
            "win_rate_pct": safe_round(get_stat("win_rate", "Win percent")),
            "ct_win_pct": safe_round(get_stat("ct_win_pct", "CT round win percent")),
            "t_win_pct": safe_round(get_stat("t_win_pct", "T round win percent")),
            "pistol_win_pct": safe_round(get_stat("pistol_round_win_pct", "Pistol round win percent")),
            "pick_pct": safe_round(get_stat("pick_pct", "Pick percent")),
            "ban_pct": safe_round(get_stat("ban_pct", "Ban percent")),
        }

    # 4. Recência por mapa
    recent_map_games = defaultdict(int)
    recent_map_wins = defaultdict(int)
    recent_map_rounds = defaultdict(list)
    map_half1_won = defaultdict(list)   
    map_half2_won = defaultdict(list)   
    map_half1_total = defaultdict(list) 
    map_half2_total = defaultdict(list) 

    team1_matches = {str(m["match_id"]) for m in matches_meta if m.get("team_1") == team_name}

    for mp in bundle.get("match_maps", []):
        mid = str(mp.get("match_id"))
        if mid not in match_ids: continue
        score = parse_score(mp.get("score_final", ""))
        if score is None: continue
        map_name = mp.get("map_name", "Unknown")
        r_won, r_lost = score
        total_rounds = r_won + r_lost

        recent_map_games[map_name] += 1
        recent_map_rounds[map_name].append(total_rounds)
        if r_won > r_lost:
            recent_map_wins[map_name] += 1

        halves = parse_halves(mp.get("half_scores", ""))
        if len(halves) >= 2:
            h1, h2 = halves[0], halves[1]
            if mid in team1_matches:
                won_h1, won_h2 = h1[0], h2[0]
                total_h1, total_h2 = h1[0] + h1[1], h2[0] + h2[1]
            else:
                won_h1, won_h2 = h1[1], h2[1]
                total_h1, total_h2 = h1[0] + h1[1], h2[0] + h2[1]

            map_half1_won[map_name].append(won_h1)
            map_half2_won[map_name].append(won_h2)
            map_half1_total[map_name].append(total_h1)
            map_half2_total[map_name].append(total_h2)

    map_summary = {}
    all_maps = set(map_global.keys()) | set(recent_map_games.keys())
    for m in all_maps:
        entry = map_global.get(m, {}).copy()
        rg = recent_map_games.get(m, 0)
        if rg > 0:
            rounds_list = recent_map_rounds[m]
            entry["recent_games"] = rg
            entry["recent_win_rate"] = round(recent_map_wins[m] / rg, 3)
            entry["avg_rounds"] = round(sum(rounds_list) / len(rounds_list), 1)
            
            h1t = map_half1_total[m]
            h2t = map_half2_total[m]
            if h1t and h2t and sum(h1t) > 0 and sum(h2t) > 0:
                entry["estimated_ct_win_pct"] = round(sum(map_half1_won[m]) / sum(h1t) * 100, 1)
                entry["estimated_t_win_pct"]  = round(sum(map_half2_won[m]) / sum(h2t) * 100, 1)

        map_summary[m] = entry

    map_summary = dict(sorted(map_summary.items(), key=lambda x: x[1].get("recent_games", 0), reverse=True))

    # 5. Perfil de rounds
    all_rounds = []
    for rl in recent_map_rounds.values():
        all_rounds.extend(rl)

    rounds_summary = None
    if all_rounds:
        s = sorted(all_rounds)
        n = len(s)
        median = s[n // 2] if n % 2 != 0 else (s[n//2 - 1] + s[n//2]) / 2
        rounds_summary = {
            "maps_sample": n,
            "avg_rounds_per_map": round(sum(all_rounds) / n, 1),
            "median_rounds_per_map": median
        }

    # 6. Veto tendências 
    veto_picks = defaultdict(int)
    veto_bans = defaultdict(int)
    for v in bundle.get("hltv_match_vetoes", []):
        if str(v.get("match_id")) not in match_ids: continue
        if v.get("team_name") != team_name: continue
        map_clean = v.get("map_name", "").replace("de_", "").capitalize()
        action = v.get("action", "").lower()
        
        if "pick" in action:
            veto_picks[map_clean] += 1
        elif "remov" in action or "ban" in action:
            veto_bans[map_clean] += 1

    # 7. Stats de jogadores
    all_players = [
        p for p in bundle.get("match_players", [])
        if str(p.get("match_id")) in match_ids and p.get("team_name") == team_name
    ]

    seen = {}
    for p in all_players:
        kd = p.get("kd_ratio", "0-0")
        mm = re.match(r"(\d+)-(\d+)", str(kd))
        total_kd = int(mm.group(1)) + int(mm.group(2)) if mm else 0
        key = (str(p["match_id"]), p["player_name"])
        if key not in seen or total_kd > seen[key]["_kd"]:
            seen[key] = {**p, "_kd": total_kd}

    player_agg = defaultdict(lambda: {"w_ratings": [], "w_adrs": [], "w_kasts": []})
    for entry in seen.values():
        nick = extract_nickname(entry["player_name"])
        w = match_weights.get(str(entry["match_id"]), 1.0)
        
        r_val = entry.get("rating", entry.get("rating_2_0", entry.get("rating2.0")))
        a_val = entry.get("adr", entry.get("ADR"))
        k_val = entry.get("kast", entry.get("KAST", "0"))
        
        rating = safe_float(r_val)
        adr = safe_float(a_val)
        kast = safe_float(k_val)

        if rating is not None: player_agg[nick]["w_ratings"].append((rating, w))
        if adr is not None:    player_agg[nick]["w_adrs"].append((adr, w))
        if kast is not None:   player_agg[nick]["w_kasts"].append((kast, w))

    def weighted_avg(pairs):
        if not pairs: return None
        total_w = sum(w for _, w in pairs)
        return round(sum(v * w for v, w in pairs) / total_w, 3) if total_w > 0 else None

    player_summary = {}
    for nick, data in player_agg.items():
        if not data["w_ratings"]: continue
        player_summary[nick] = {
            "matches": len(data["w_ratings"]),
            "avg_rating": weighted_avg(data["w_ratings"]),
            "avg_adr": round(weighted_avg(data["w_adrs"]), 1) if data["w_adrs"] else None,
            "avg_kast": round(weighted_avg(data["w_kasts"]), 1) if data["w_kasts"] else None,
        }

    player_summary = dict(sorted(player_summary.items(), key=lambda x: x[1]["avg_rating"], reverse=True))

    match_history = []
    for m in matches_meta:
        is_team1 = m.get("team_1") == team_name
        opponent = m.get("team_2") if is_team1 else m.get("team_1")
        s1, s2 = m.get("score_1") or 0, m.get("score_2") or 0
        match_history.append({
            "date": m.get("date"),
            "opponent": opponent,
            "result": "W" if (is_team1 and s1 > s2) or (not is_team1 and s2 > s1) else "L",
            "score": f"{s1}-{s2}" if is_team1 else f"{s2}-{s1}",
        })

    return {
        "team": team_name,
        "recent_form": recent_form_str,
        "rounds_profile": rounds_summary,
        "map_stats": map_summary,
        "player_averages": player_summary,
        "veto_tendencies": {
            "picks": dict(sorted(veto_picks.items(), key=lambda x: x[1], reverse=True)),
            "bans": dict(sorted(veto_bans.items(), key=lambda x: x[1], reverse=True)),
        },
        "match_history": match_history,
    }


# ── Processamento das odds ─────────────────────────────────────────────────────

def process_odds(odds_data: dict) -> dict:
    raw_lines = []
    for block in odds_data.get("content", []):
        raw_lines.extend(block.get("raw_dump", []))

    result = {}
    
    # Identificadores dinâmicos de mercados para não engessar o script
    valid_market_suffixes = ("– Match", "– Map 1", "– Map 2", "Score", "Margin", "Odd/Even", "Overtime?")
    valid_market_prefixes = ("Will ", "(Map 1)", "(Map 2)", "Correct")
    
    i = 0
    while i < len(raw_lines):
        line = raw_lines[i].strip()
        
        # Condição para identificar se a linha é o título de um mercado
        is_market = (
            line.endswith(valid_market_suffixes) or 
            line.startswith(valid_market_prefixes) or
            line == "Correct Score"
        )
        
        # Filtro para ignorar lixos da navegação do site
        if line in ("Decimal Odds", "LIVE CENTRE") or "betting" in line.lower():
            is_market = False

        if is_market:
            market = line
            result[market] = {}
            i += 1
            
            # Tratamento para mercados que usam tabulação para os times (ex: Handicap, Team Total)
            if i < len(raw_lines) and "\t" in raw_lines[i]:
                teams = [t.strip() for t in raw_lines[i].split("\t")]
                i += 1
                
                if "Team Total" in market:
                    try:
                        # Team Total tem 4 pares de linhas (Over/Under Time A, Over/Under Time B)
                        for t_idx in range(2):
                            for _ in range(2):
                                lbl = raw_lines[i].strip()
                                val = float(raw_lines[i+1].strip())
                                result[market][f"{teams[t_idx]} {lbl}"] = val
                                i += 2
                    except (IndexError, ValueError):
                        pass
                else:
                    try:
                        # Handicap de mapa/match tem 2 pares
                        for t_idx in range(2):
                            lbl = raw_lines[i].strip()
                            val = float(raw_lines[i+1].strip())
                            result[market][f"{teams[t_idx]} {lbl}"] = val
                            i += 2
                    except (IndexError, ValueError):
                        pass
                continue
            
            # Tratamento para mercados padrão (Label numa linha, odd na outra)
            while i < len(raw_lines):
                sub_line = raw_lines[i].strip()
                if sub_line in ("See more", "Hide All", ""):
                    i += 1
                    continue
                
                # Sai do sub-loop se bater em outro título de mercado ou rodapé
                if (sub_line.endswith(valid_market_suffixes) or 
                    sub_line.startswith(valid_market_prefixes) or 
                    sub_line in ("FAVOURITES", "TOP SPORTS", "Correct Score")):
                    break
                    
                # Tratamento especial para props de "Yes/No" (a Pinnacle omite o label "No")
                if sub_line == "Yes" and i + 2 < len(raw_lines):
                    try:
                        yes_val = float(raw_lines[i+1].strip())
                        no_val = float(raw_lines[i+2].strip())
                        result[market]["Yes"] = yes_val
                        result[market]["No"] = no_val
                        i += 3
                        continue
                    except ValueError:
                        pass
                        
                # Leitura comum: Label -> Float
                if i + 1 < len(raw_lines):
                    try:
                        val = float(raw_lines[i+1].strip())
                        result[market][sub_line] = val
                        i += 2
                        continue
                    except ValueError:
                        # Se não converte para float, o mercado acabou ou a estrutura quebrou
                        break
                        
                i += 1
            continue
        i += 1

    return {"markets": result}

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--team_a", required=True)
    parser.add_argument("--team_b", required=True)
    parser.add_argument("--odds",   required=True)
    parser.add_argument("--output", default="resumo.json")
    parser.add_argument("--last_n", type=int, default=20)
    args = parser.parse_args()

    with open(args.team_a, encoding="utf-8") as f: bundle_a = json.load(f)
    with open(args.team_b, encoding="utf-8") as f: bundle_b = json.load(f)
    with open(args.odds, encoding="utf-8") as f:   odds_raw = json.load(f)

    name_a = bundle_a.get("meta", {}).get("team_name", "Team A")
    name_b = bundle_b.get("meta", {}).get("team_name", "Team B")

    summary = {
        "match": {"team_a": name_a, "team_b": name_b},
        name_a: process_team_bundle(bundle_a, name_a, args.last_n),
        name_b: process_team_bundle(bundle_b, name_b, args.last_n),
        "odds": process_odds(odds_raw),
    }

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    # Pegar destaques para mostrar no terminal
    a, b = summary[name_a], summary[name_b]
    p_a = list(a.get("player_averages", {}).keys())
    p_b = list(b.get("player_averages", {}).keys())
    
    print(f"\n✓ Resumo gerado com sucesso: {args.output} ({os.path.getsize(args.output) / 1024:.1f} KB)")
    print(f"============================================================")
    print(f" {name_a} [{a.get('recent_form','')}] vs {name_b} [{b.get('recent_form','')}]")
    print(f"============================================================")
    print(f" [Vetos {name_a}] Picks: {list(a.get('veto_tendencies',{}).get('picks',{}).keys())[:2]} | Bans: {list(a.get('veto_tendencies',{}).get('bans',{}).keys())[:2]}")
    print(f" [Vetos {name_b}] Picks: {list(b.get('veto_tendencies',{}).get('picks',{}).keys())[:2]} | Bans: {list(b.get('veto_tendencies',{}).get('bans',{}).keys())[:2]}")
    if p_a:
        print(f" [Destaque {name_a}] {p_a[0]} (Rating: {a['player_averages'][p_a[0]]['avg_rating']} | ADR: {a['player_averages'][p_a[0]]['avg_adr']})")
    if p_b:
        print(f" [Destaque {name_b}] {p_b[0]} (Rating: {b['player_averages'][p_b[0]]['avg_rating']} | ADR: {b['player_averages'][p_b[0]]['avg_adr']})")
    print(f"============================================================\n")

if __name__ == "__main__":
    main()