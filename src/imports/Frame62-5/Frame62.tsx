function Frame26() {
  return <div className="bg-[#242424] rounded-[62.5px] shrink-0 size-[24px]" />;
}

function Frame27() {
  return <div className="bg-[#242424] rounded-[62.5px] shrink-0 size-[24px]" />;
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[12px] items-start p-[12px] relative shrink-0">
      <Frame26 />
      <Frame27 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[24px] text-white whitespace-nowrap">Next games data indicators betting</p>
      <Frame10 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center pr-[4px] py-[4px] relative rounded-[2px] shrink-0">
      <div className="relative shrink-0 size-[2px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 2">
          <circle cx="1" cy="1" fill="var(--fill-0, #BBFF14)" id="Ellipse 2" r="1" />
        </svg>
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#bbff14] text-[14px] whitespace-nowrap">Análise ativa</p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex items-center justify-center px-[4px] py-[2px] relative rounded-[2px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#5e5e5e] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[2px]" />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#5e5e5e] text-[8px] whitespace-nowrap">BO3</p>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Frame12 />
      <Frame13 />
    </div>
  );
}

function Frame29() {
  return <div className="bg-[#242424] rounded-[62.5px] shrink-0 size-[20px]" />;
}

function Frame23() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame14 />
      <Frame29 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium min-w-full relative shrink-0 text-[#5e5e5e] text-[10px] w-[min-content]">#8</p>
      <p className="font-['Barlow_Condensed:Medium',sans-serif] relative shrink-0 text-[28px] text-white whitespace-nowrap">Natus Vincere</p>
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <Frame16 />
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium min-w-full relative shrink-0 text-[#5e5e5e] text-[10px] w-[min-content]">#12</p>
      <p className="font-['Barlow_Condensed:Medium',sans-serif] relative shrink-0 text-[28px] text-white whitespace-nowrap">G2</p>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame18 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame17 />
      <Frame19 />
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame21 />
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#ddd] text-[10px] w-full">PGL Cluj-Napoca 2026</p>
      <Frame20 />
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex flex-col gap-[7px] items-start relative shrink-0 w-full">
      <Frame23 />
      <Frame22 />
    </div>
  );
}

function Frame24() {
  return (
    <div className="bg-white relative rounded-[4px] self-stretch shrink-0">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[8px] text-black whitespace-nowrap">PRÉ GAME</p>
        </div>
      </div>
    </div>
  );
}

function Frame11() {
  return (
    <div className="bg-[#131313] flex-[1_0_0] min-h-px min-w-px relative rounded-[4px]">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] py-[8px] relative w-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">Entries 7 EV+</p>
        </div>
      </div>
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
      <Frame24 />
      <Frame11 />
    </div>
  );
}

function DefaultCard() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[20px]" data-name="default_card">
      <div aria-hidden="true" className="absolute border border-[#2b2b2b] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-center justify-center p-[18px] relative w-full">
          <Frame28 />
          <Frame25 />
        </div>
      </div>
    </div>
  );
}

function Frame32() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center pr-[4px] py-[4px] relative rounded-[2px] shrink-0">
      <div className="relative shrink-0 size-[2px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 2">
          <circle cx="1" cy="1" fill="var(--fill-0, #BBFF14)" id="Ellipse 2" r="1" />
        </svg>
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#bbff14] text-[14px] whitespace-nowrap">aberto</p>
    </div>
  );
}

function Frame33() {
  return (
    <div className="content-stretch flex items-center justify-center px-[4px] py-[2px] relative rounded-[2px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#5e5e5e] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[2px]" />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#5e5e5e] text-[8px] whitespace-nowrap">BO3</p>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Frame32 />
      <Frame33 />
    </div>
  );
}

function Frame34() {
  return <div className="bg-[#242424] rounded-[62.5px] shrink-0 size-[20px]" />;
}

function Frame31() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame15 />
      <Frame34 />
    </div>
  );
}

function Frame39() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium min-w-full relative shrink-0 text-[#696969] text-[10px] w-[min-content]">#8</p>
      <p className="font-['Barlow_Condensed:Medium',sans-serif] relative shrink-0 text-[28px] text-white whitespace-nowrap">Spirit</p>
    </div>
  );
}

function Frame38() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <Frame39 />
    </div>
  );
}

function Frame41() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium min-w-full relative shrink-0 text-[#696969] text-[10px] w-[min-content]">#12</p>
      <p className="font-['Barlow_Condensed:Medium',sans-serif] relative shrink-0 text-[28px] text-white whitespace-nowrap">Falcons</p>
    </div>
  );
}

function Frame40() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame41 />
    </div>
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame38 />
      <Frame40 />
    </div>
  );
}

function Frame36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame37 />
    </div>
  );
}

function Frame35() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#ddd] text-[10px] w-full">PGL Cluj-Napoca 2026</p>
      <Frame36 />
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex flex-col gap-[7px] items-start relative shrink-0 w-full">
      <Frame31 />
      <Frame35 />
    </div>
  );
}

function Frame44() {
  return (
    <div className="bg-white relative rounded-[4px] self-stretch shrink-0">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[8px] text-black whitespace-nowrap">PRÉ GAME</p>
        </div>
      </div>
    </div>
  );
}

function Frame45() {
  return (
    <div className="bg-[#131313] flex-[1_0_0] min-h-px min-w-px relative rounded-[4px]">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] py-[8px] relative w-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">Entries 5 EV+</p>
        </div>
      </div>
    </div>
  );
}

function Frame43() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
      <Frame44 />
      <Frame45 />
    </div>
  );
}

function OpenCard() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[20px]" data-name="open_card">
      <div aria-hidden="true" className="absolute border border-[#2b2b2b] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-center justify-center p-[18px] relative w-full">
          <Frame30 />
          <Frame43 />
        </div>
      </div>
    </div>
  );
}

function Frame49() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center pr-[4px] py-[4px] relative rounded-[2px] shrink-0">
      <div className="relative shrink-0 size-[2px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 2">
          <circle cx="1" cy="1" fill="var(--fill-0, #F26500)" id="Ellipse 2" r="1" />
        </svg>
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#f26500] text-[14px] whitespace-nowrap">fechado</p>
    </div>
  );
}

function Frame50() {
  return (
    <div className="content-stretch flex items-center justify-center px-[4px] py-[2px] relative rounded-[2px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#5e5e5e] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[2px]" />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#5e5e5e] text-[8px] whitespace-nowrap">BO3</p>
    </div>
  );
}

function Frame48() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Frame49 />
      <Frame50 />
    </div>
  );
}

function Frame51() {
  return <div className="bg-[#242424] rounded-[62.5px] shrink-0 size-[20px]" />;
}

function Frame47() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame48 />
      <Frame51 />
    </div>
  );
}

function Frame56() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium min-w-full relative shrink-0 text-[#696969] text-[10px] w-[min-content]">#8</p>
      <p className="font-['Barlow_Condensed:Medium',sans-serif] relative shrink-0 text-[28px] text-white whitespace-nowrap">The MongolZ</p>
    </div>
  );
}

function Frame55() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <Frame56 />
    </div>
  );
}

function Frame58() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium min-w-full relative shrink-0 text-[#696969] text-[10px] w-[min-content]">#12</p>
      <p className="font-['Barlow_Condensed:Medium',sans-serif] relative shrink-0 text-[28px] text-white whitespace-nowrap">Heroic</p>
    </div>
  );
}

function Frame57() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame58 />
    </div>
  );
}

function Frame54() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame55 />
      <Frame57 />
    </div>
  );
}

function Frame53() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame54 />
    </div>
  );
}

function Frame52() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#ddd] text-[10px] w-full">PGL Cluj-Napoca 2026</p>
      <Frame53 />
    </div>
  );
}

function Frame46() {
  return (
    <div className="content-stretch flex flex-col gap-[7px] items-start relative shrink-0 w-full">
      <Frame47 />
      <Frame52 />
    </div>
  );
}

function Frame60() {
  return (
    <div className="bg-white relative rounded-[4px] self-stretch shrink-0">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[8px] text-black whitespace-nowrap">PRÉ GAME</p>
        </div>
      </div>
    </div>
  );
}

function Frame61() {
  return (
    <div className="bg-[#131313] flex-[1_0_0] min-h-px min-w-px relative rounded-[4px]">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] py-[8px] relative w-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">Entries 3 EV+</p>
        </div>
      </div>
    </div>
  );
}

function Frame59() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
      <Frame60 />
      <Frame61 />
    </div>
  );
}

function CloseCard() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[20px]" data-name="close_card">
      <div aria-hidden="true" className="absolute border border-[#2b2b2b] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-center justify-center p-[18px] relative w-full">
          <Frame46 />
          <Frame59 />
        </div>
      </div>
    </div>
  );
}

function Frame65() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center pr-[4px] py-[4px] relative rounded-[2px] shrink-0">
      <div className="relative shrink-0 size-[2px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 2">
          <circle cx="1" cy="1" fill="var(--fill-0, #19BBFF)" id="Ellipse 2" r="1" />
        </svg>
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#19bbff] text-[14px] whitespace-nowrap">balanço</p>
    </div>
  );
}

function Frame66() {
  return (
    <div className="content-stretch flex items-center justify-center px-[4px] py-[2px] relative rounded-[2px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#5e5e5e] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[2px]" />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#5e5e5e] text-[8px] whitespace-nowrap">BO3</p>
    </div>
  );
}

function Frame64() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Frame65 />
      <Frame66 />
    </div>
  );
}

function Frame67() {
  return <div className="bg-[#242424] rounded-[62.5px] shrink-0 size-[20px]" />;
}

function Frame63() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame64 />
      <Frame67 />
    </div>
  );
}

function Frame72() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium min-w-full relative shrink-0 text-[#696969] text-[10px] w-[min-content]">#8</p>
      <p className="font-['Barlow_Condensed:Medium',sans-serif] relative shrink-0 text-[28px] text-white whitespace-nowrap">Furia</p>
    </div>
  );
}

function Frame71() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <Frame72 />
    </div>
  );
}

function Frame74() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic relative shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium min-w-full relative shrink-0 text-[#696969] text-[10px] w-[min-content]">#12</p>
      <p className="font-['Barlow_Condensed:Medium',sans-serif] relative shrink-0 text-[28px] text-white whitespace-nowrap">MIBR</p>
    </div>
  );
}

function Frame73() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame74 />
    </div>
  );
}

function Frame70() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame71 />
      <Frame73 />
    </div>
  );
}

function Frame69() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame70 />
    </div>
  );
}

function Frame68() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#ddd] text-[10px] w-full">PGL Cluj-Napoca 2026</p>
      <Frame69 />
    </div>
  );
}

function Frame62() {
  return (
    <div className="content-stretch flex flex-col gap-[7px] items-start relative shrink-0 w-full">
      <Frame63 />
      <Frame68 />
    </div>
  );
}

function Frame76() {
  return (
    <div className="bg-white relative rounded-[4px] self-stretch shrink-0">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[8px] text-black whitespace-nowrap">PRÉ GAME</p>
        </div>
      </div>
    </div>
  );
}

function Frame77() {
  return (
    <div className="bg-[#131313] flex-[1_0_0] min-h-px min-w-px relative rounded-[4px]">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] py-[8px] relative w-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">Entries 2 EV+</p>
        </div>
      </div>
    </div>
  );
}

function Frame75() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
      <Frame76 />
      <Frame77 />
    </div>
  );
}

function BalanceCard() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[20px]" data-name="balance_card">
      <div aria-hidden="true" className="absolute border border-[#2b2b2b] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-center justify-center p-[18px] relative w-full">
          <Frame62 />
          <Frame75 />
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
      <DefaultCard />
      <OpenCard />
      <CloseCard />
      <BalanceCard />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative">
      <Frame9 />
      <Frame7 />
    </div>
  );
}

function Frame82() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center pr-[4px] py-[4px] relative rounded-[2px] shrink-0">
      <div className="relative shrink-0 size-[2px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 2">
          <circle cx="1" cy="1" fill="var(--fill-0, #E3FF0F)" id="Ellipse 2" r="1" />
        </svg>
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#e3ff0f] text-[6px] uppercase whitespace-nowrap">Skin in the game</p>
    </div>
  );
}

function Frame81() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame82 />
    </div>
  );
}

function Frame84() {
  return (
    <div className="content-stretch flex items-center justify-center pr-[4px] py-[4px] relative rounded-[2px] shrink-0">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[6px] text-white whitespace-nowrap">2 WEEKS</p>
    </div>
  );
}

function Frame83() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame84 />
    </div>
  );
}

function Frame80() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame81 />
      <Frame83 />
    </div>
  );
}

function Frame79() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame80 />
    </div>
  );
}

function ChevronBackward() {
  return <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start" data-name="chevron_backward" />;
}

function Frame() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">conservador</p>
      <div className="flex items-center justify-center leading-[0] relative shrink-0 size-[20px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <ChevronBackward />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#0d0f14] relative rounded-[4px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#4b4b4b] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="content-stretch flex flex-col items-start px-[12px] py-[6px] relative w-full">
        <Frame />
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full">
      <Frame1 />
    </div>
  );
}

function Frame78() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame79 />
      <Frame2 />
    </div>
  );
}

function Frame87() {
  return <div className="bg-[#16a34a] rounded-[50px] shrink-0 size-[13px]" />;
}

function Frame5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Barlow_Condensed:SemiBold',sans-serif] leading-none not-italic relative shrink-0 text-[64px] text-white whitespace-nowrap">12u</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0">
      <Frame5 />
    </div>
  );
}

function Frame86() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0">
      <Frame87 />
      <Frame4 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0">
      <Frame86 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">Profit in 14 days</p>
    </div>
  );
}

function Frame85() {
  return (
    <div className="content-stretch flex items-center justify-between p-[12px] relative rounded-[4px] shrink-0 w-[126px]">
      <Frame3 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame85 />
    </div>
  );
}

function FixedProfitCard() {
  return (
    <div className="h-full relative rounded-[20px] shrink-0 w-[218px]" data-name="fixed_profit_card">
      <div aria-hidden="true" className="absolute border border-[#2b2b2b] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center p-[24px] relative size-full">
          <Frame78 />
          <Frame6 />
        </div>
      </div>
    </div>
  );
}

function ProfitBanner() {
  return (
    <div className="bg-[#05060f] relative shrink-0 w-full" data-name="profit_banner">
      <div className="flex flex-row items-end justify-center size-full">
        <div className="content-stretch flex gap-[24px] items-end justify-center px-[48px] py-[24px] relative w-full">
          <Frame8 />
          <div className="flex flex-row items-end self-stretch">
            <FixedProfitCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Frame42() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full">
      <ProfitBanner />
    </div>
  );
}