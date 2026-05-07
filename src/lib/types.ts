// src/lib/types.ts

export type CardState = 'neutral' | 'yellow' | 'gold' | 'cyan';
export type Confidence = 'S' | 'A' | 'B' | 'C' | 'SEM EDGE';
export type EntryStatus = 'default' | 'green' | 'red';

export interface EntryRecord {
  id?: number;
  match_slug: string;
  market_name: string;
  odd: number;
  stake: number;
  status: EntryStatus;
  created_at?: string;
}

export interface MatchRow {
  id?: number;
  slug: string;
  team_a: string;
  team_b: string;
  tournament: string;
  match_date: string;
  status: string;
  confidence: Confidence;
  cover_image?: string;
  created_at?: string;
}

export interface Entry {
  rank: number;
  market_name: string;
  odd: number;
  implied_prob: number;
  estimated_prob: number;
  edge: number;
  confidence: Confidence;
  stake: number;
  justification_points: string[];
  verdict: string;
}

export interface MatchAnalysis {
  header: {
    match: string;
    event: string;
    date: string;
    format: string;
    analyst_date?: string;
  };
  confidence_legend: any;
  context: any;
  veto_prediction: any;
  map_analysis: any;
  bo3_probabilities: any;
  entries_ranked: Entry[];
  odds_movement: any;
  alerts: string[];
  do_not_recommend: any[];
  recommendations: any;
  summary_table: any[];
  disclaimer?: string;
}