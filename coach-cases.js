/* Original fictional exercises; answer checklists grounded in the bundled course readers.
   These are self-assessed teach-backs, not automated grading or client recommendations. */
window.CFP_CLIENT_CASES = [
  {id:'discovery',course:'FP511',mod:1,domain:'B',title:'Can you just tell me what to buy?',
    scenario:'Alex wants a recommendation but has not supplied debt balances, income details or priorities.',
    prompt:'Explain why you need more information and what happens if Alex declines to provide it.',
    points:['Gather both quantitative facts and qualitative circumstances.','Identify and prioritize goals before making recommendations.','If information remains inadequate, limit the scope to matters with sufficient information or terminate the engagement.','Communicate any scope limitation clearly.'],
    source:'apps/fp511-reading.html#planning',anchor:'Financial planning process — Steps 1–7',basis:'FP511 textbook cards: steps 1, 2 and 3'},
  {id:'risk',course:'FP511',mod:2,domain:'H',title:'I like risk—but I may need this money.',
    scenario:'Jordan enjoys investment risk but may need these savings soon for family expenses.',
    prompt:'Explain willingness to take risk versus ability to absorb a loss. Ask one useful follow-up question.',
    points:['Risk tolerance is willingness to accept risk/reward tradeoffs.','Risk capacity concerns the financial resources available to absorb risk.','Tolerance and capacity can differ.','Ask an open-ended question about goals, timing or financial circumstances.'],
    source:'apps/fp511-reading.html#psychology',anchor:'Risk attitudes and client communication',basis:'FP511 textbook cards: risk profiling; open-ended questions'},
  {id:'cashflow',course:'FP511',mod:3,domain:'B',title:'My net worth is up. Why am I short on cash?',
    scenario:'Casey’s home value increased, but monthly outflows exceed income.',
    prompt:'Explain how rising net worth and negative cash flow can happen together.',
    points:['A balance sheet measures assets and liabilities at a point in time.','Net worth equals assets minus liabilities.','A cash-flow statement measures inflows and outflows over a period.','Outflows can exceed inflows even when net worth is positive or rising.'],
    source:'apps/fp511-reading.html#statements',anchor:'Balance sheet and cash-flow statement',basis:'FP511 textbook cards: financial statements'},
  {id:'timing',course:'FP511',mod:4,domain:'B',title:'Does it matter when I save?',
    scenario:'Taylor compares equal annual deposits at the beginning versus end of each year. The plans use the same positive return and number of deposits.',
    prompt:'Which plan ends with more money, and why? Name the calculator mode for each.',
    points:['End-of-period deposits form an ordinary annuity.','Beginning-of-period deposits form an annuity due.','Earlier deposits earn one extra period of interest under these assumptions.','Use END for an ordinary annuity and BEG for an annuity due.'],
    source:'apps/fp511-reading.html#tvm',anchor:'Ordinary annuity and annuity due',basis:'FP511 textbook cards: annuity timing'},
  {id:'conflict',course:'FP511',mod:5,domain:'A',title:'I still believe it’s the best recommendation.',
    scenario:'A planner’s firm pays more for one recommended product. The planner believes it is appropriate for Morgan.',
    prompt:'Explain what the planner must do about the material compensation conflict.',
    points:['Put the client’s interests first.','Avoid or fully disclose the material conflict with sufficiently specific facts.','Obtain informed consent when proceeding with the disclosed conflict.','Manage the conflict; disclosure alone is insufficient.'],
    source:'apps/fp511-reading.html#conduct',anchor:'Fiduciary duty and conflicts of interest',basis:'FP511 textbook cards: fiduciary duty; material conflicts'},
  {id:'transfer',course:'FP512',mod:1,domain:'C',title:'Should I insure every possible expense?',
    scenario:'Lee can absorb occasional minor repairs but could not absorb a catastrophic property loss.',
    prompt:'Explain why these risks can call for different responses.',
    points:['Assess both frequency and severity.','Insurance commonly transfers low-frequency, high-severity risks.','Manageable small losses can be retained, including through deductibles.','Risk reduction lowers loss frequency or severity.'],
    source:'apps/fp512-reading.html#overview',anchor:'Risk-management matrix',basis:'FP512 textbook cards: risk management; retention; reduction; transfer'},
  {id:'umbrella',course:'FP512',mod:2,domain:'C',title:'Can my umbrella replace my auto liability?',
    scenario:'Avery buys a personal umbrella policy and wants to cancel the underlying auto liability coverage.',
    prompt:'Explain how underlying insurance and an umbrella work together.',
    points:['The umbrella supplies excess liability coverage.','The relevant underlying policy pays first.','Maintain the underlying limits required by the umbrella policy.','An umbrella may also broaden coverage, such as for personal injury.'],
    source:'apps/fp512-reading.html#property',anchor:'Personal umbrella liability',basis:'FP512 textbook cards: umbrella policies'},
  {id:'life',course:'FP512',mod:3,domain:'C',title:'How much life insurance would my family need?',
    scenario:'Sam has a spouse, children, a mortgage and education goals and asks what a needs discussion should cover.',
    prompt:'Use LIFE to explain the four categories you would review.',
    points:['L: liquidation of debts.','I: income replacement.','F: final expenses.','E: education funding.'],
    source:'apps/fp512-reading.html#life',anchor:'Life insurance needs analysis',basis:'FP512 textbook cards: LIFE needs checklist'},
  {id:'disability',course:'FP512',mod:6,domain:'C',title:'I can’t perform my specialty, but I can teach.',
    scenario:'An injury prevents specialist Drew from performing that occupation. Drew can work as a teacher.',
    prompt:'Explain why teaching matters differently under own-occupation, modified own-occupation and any-occupation coverage.',
    points:['Own-occupation focuses on inability to perform the original occupation.','Modified own-occupation also requires not working in another occupation.','Any-occupation considers gainful work for which the insured is reasonably qualified.','Eligibility follows the policy’s definition; a split definition can change the standard after an initial period.'],
    source:'apps/fp512-reading.html#disability',anchor:'Definitions of total disability',basis:'FP512 textbook cards: own, modified-own, any and split definitions'},
  {id:'business',course:'FP512',mod:8,domain:'C',title:'One policy for two business problems?',
    scenario:'Two business owners want cash to sustain operations if a crucial person dies and funding to purchase a deceased owner’s interest.',
    prompt:'Explain key-person protection versus funding a buy-sell arrangement.',
    points:['Key-person insurance provides working capital or replacement support for the business.','The business owns and benefits from its key-person policy.','In a cross-purchase arrangement, owners buy policies on one another.','In an entity-purchase arrangement, the business buys the policies.'],
    source:'apps/fp512-reading.html#business',anchor:'Buy-sell agreements and key-person insurance',basis:'FP512 textbook cards: key-person; cross-purchase; entity-purchase'}
];
/* FP513-GEN-START */
window.CFP_CLIENT_CASES = window.CFP_CLIENT_CASES.concat([
 {
  "id": "fp513-wash-sale",
  "course": "FP513",
  "mod": 1,
  "domain": "D",
  "title": "\"Why can't I sell my losing stock for the tax write-off and buy it right back?\"",
  "scenario": "Fictional client Derek, 52, has a large gain from selling a mutual fund this year and holds a tech stock down $8,000. He wants to sell it in December and repurchase it the next week.",
  "prompt": "Explain the wash sale rule, what happens to his loss if he repurchases within the window, and his alternatives.",
  "points": [
   "Wash sale = loss sale plus acquiring similar securities within 30 days before or after (2026 edition figure)",
   "The loss isn't recognized now; it's added to the basis of the new shares, so it's deferred, not lost",
   "A December sale and January repurchase is still inside the window",
   "Alternatives: wait out the window, or hold a similar-but-different position (for bonds, a similar bond from another issuer)",
   "Show how the harvested loss nets against his gains first, with any net loss capped at $3,000 a year and the rest carried forward"
  ],
  "source": "apps/fp513-reading.html#markets",
  "anchor": "LO 1.4.1 · Capital gain netting and wash sales",
  "basis": "FP513 textbook (2026 ed.) — Module 1; original fictional case"
 },
 {
  "id": "fp513-mmf-vs-mmda",
  "course": "FP513",
  "mod": 1,
  "domain": "D",
  "title": "\"Is my money market fund insured like my bank account?\"",
  "scenario": "Fictional retiree Lorraine, 71, keeps $180,000 in a brokerage money market fund and $60,000 in a bank money market account as her emergency reserve.",
  "prompt": "Explain the difference between an MMDA and a money market mutual fund, what protection each has, and the risk of holding too much cash.",
  "points": [
   "MMDA is a bank deposit, FDIC-insured to $250,000 per ownership category (2026 edition figure)",
   "A money market mutual fund is an investment company product and is not federally insured",
   "SIPC protects against broker failure (up to $500,000, $250,000 cash; 2026 edition figure), not market losses",
   "Both are liquid, but only marketable instruments trade beyond the issuer",
   "Too much cash exposes a retiree to purchasing power risk from inflation"
  ],
  "source": "apps/fp513-reading.html#markets",
  "anchor": "LO 1.3.1 · Cash and cash equivalents",
  "basis": "FP513 textbook (2026 ed.) — Module 1; original fictional case"
 },
 {
  "id": "fp513-convertible-premium",
  "course": "FP513",
  "mod": 2,
  "domain": "D",
  "title": "Why would I pay $1,000 for a bond that's only worth $851 as a bond?",
  "scenario": "Rosa, 58, is offered a convertible bond priced at $1,000. Its straight-bond value is $851.23 and it converts into 16 shares of a $55 stock.",
  "prompt": "Explain what she is paying for, how far it could fall, and what protects her.",
  "points": [
   "Conversion value = 16 &times; $55 = $880; the bond can't trade below the greater of $880 and $851.23",
   "The $148.77 above straight value (17.48%) is the price of the option to share in the stock's upside",
   "Downside risk = $148.77 &divide; $1,000 = 14.88% to the straight-bond cushion",
   "The cushion moves with interest rates, so it is not fixed",
   "Trade-off: a lower coupon than a straight bond in exchange for the conversion right"
  ],
  "source": "apps/fp513-reading.html#debt",
  "anchor": "LO 2.2.1 · Convertible bond math",
  "basis": "FP513 textbook (2026 ed.) — Module 2; original fictional case"
 },
 {
  "id": "fp513-inverted-curve",
  "course": "FP513",
  "mod": 2,
  "domain": "D",
  "title": "Short-term CDs and bills pay more than long bonds right now, so why would I lock up money for 20 years?",
  "scenario": "Marcus, 61, an income investor, sees 1-year bills at 5.2% and 20-year bonds at 4.4% and wants to keep everything short.",
  "prompt": "Explain what an inverted yield curve signals and why the textbook favors call-protected long bonds here.",
  "points": [
   "An inverted curve usually follows Fed tightening against inflation and signals falling rates ahead",
   "When the curve normalizes, short rates fall the most; bills mature and get reinvested lower",
   "Long bonds lock in today's rate and rise in price as rates fall",
   "Call protection keeps the issuer from redeeming the bond once rates drop",
   "His horizon may run 20+ years, so staying all-short adds reinvestment risk"
  ],
  "source": "apps/fp513-reading.html#debt",
  "anchor": "LO 2.4.1 · Using yield curves to make decisions",
  "basis": "FP513 textbook (2026 ed.) — Module 2; original fictional case"
 },
 {
  "id": "fp513-fund-tax-bill",
  "course": "FP513",
  "mod": 3,
  "domain": "D",
  "title": "\"I never sold a thing, so why did my mutual fund send me a tax bill?\"",
  "scenario": "Dana, 52, holds an actively managed growth fund in a taxable account and reinvests everything. After a strong market year she received a 1099 showing a large capital gain distribution and is upset.",
  "prompt": "Explain why a mutual fund can create taxable income without a sale, and what she can do about it going forward.",
  "points": [
   "Funds must distribute their net realized gains each year, and the shareholder is taxed on them",
   "Reinvesting doesn't avoid tax (constructive receipt), but reinvested amounts do add to her basis",
   "High turnover tends to produce bigger distributions; index funds and ETFs tend to be more tax-efficient",
   "Check distribution dates before buying so she doesn't buy a tax bill late in the year",
   "Tax-inefficient funds are better placed in tax-deferred accounts"
  ],
  "source": "apps/fp513-reading.html#equity",
  "anchor": "LO 3.3.1 · Fund taxation and closed-end funds, UITs and SMAs",
  "basis": "FP513 textbook (2026 ed.) — Module 3; original fictional case"
 },
 {
  "id": "fp513-dca-bonus",
  "course": "FP513",
  "mod": 3,
  "domain": "D",
  "title": "\"Should I invest my $60,000 bonus all at once or a little each month?\"",
  "scenario": "Theo, 34, received a $60,000 bonus and is nervous the market could drop right after he invests. He is considering $5,000 a month for a year.",
  "prompt": "Explain dollar cost averaging, how it lowers average cost, and when it helps or hurts compared with a lump sum.",
  "points": [
   "DCA invests a fixed dollar amount on a schedule, so it buys more shares when prices are low",
   "Average cost per share (total dollars &divide; shares) ends up below the average price",
   "It limits the regret of investing everything just before a drop",
   "In a steadily rising market a lump sum up front usually does better",
   "DCA does not guarantee a profit if the investment keeps falling"
  ],
  "source": "apps/fp513-reading.html#equity",
  "anchor": "LO 3.5.1 · Averaging techniques",
  "basis": "FP513 textbook (2026 ed.) — Module 3; original fictional case"
 },
 {
  "id": "fp513-duration-swap",
  "course": "FP513",
  "mod": 4,
  "domain": "D",
  "title": "Why would I give up yield to move into the short-term bond fund?",
  "scenario": "Renata, 61, holds a long-term bond fund (duration about 13, yield 4.4%) and needs the money for a home renovation in about two to three years. You suggest a short-term fund (duration about 2.4, yield 3.1%).",
  "prompt": "Explain duration and interest-rate risk in plain language and justify the switch.",
  "points": [
   "Duration estimates the % price change for a 1-point rate move (about 13% vs. about 2.4%)",
   "The extra 1.3% of yield buys roughly 10.5 more points of downside if rates jump 1%",
   "A bond fund never matures, so she cannot simply hold to maturity to escape price swings",
   "Matching duration to her 2-3 year horizon protects the money she will need soon",
   "Bigger rate moves are curved, not linear (convexity), but direction and scale still hold"
  ],
  "source": "apps/fp513-reading.html#valuation",
  "anchor": "LO 4.1.2 · Estimating price change with duration",
  "basis": "FP513 textbook (2026 ed.) — Module 4; original fictional case"
 },
 {
  "id": "fp513-high-roe-trap",
  "course": "FP513",
  "mod": 4,
  "domain": "D",
  "title": "This stock has a 40% ROE and a fat dividend. Isn't it a no-brainer?",
  "scenario": "Theo wants to buy a company with a 40% ROE, a 6% ROA, heavy long-term debt and a 60% payout ratio instead of a debt-free rival with a 22% ROE and a 25% payout.",
  "prompt": "Explain how leverage inflates ROE, what it means for risk and growth, and how you would judge value.",
  "points": [
   "Debt shrinks equity, so ROE rises even when asset returns are modest; low ROA vs. ROE flags it",
   "Fixed interest cuts net income and is hard to carry in a contraction",
   "g = ROE &times; retention: 40% &times; 0.40 = 16% vs. 22% &times; 0.75 = 16.5%, so the payout choice matters",
   "If the firm can reinvest at a high ROE, retaining more would grow future dividends faster",
   "Decide on price by comparing intrinsic value (DDM) or P/E and PEG with peers, not ROE alone"
  ],
  "source": "apps/fp513-reading.html#valuation",
  "anchor": "LO 4.2.2 · Financial leverage, ROE and dividend growth",
  "basis": "FP513 textbook (2026 ed.) — Module 4; original fictional case"
 },
 {
  "id": "fp513-covered-call",
  "course": "FP513",
  "mod": 5,
  "domain": "D",
  "title": "“Can I squeeze more income out of my bank stock without selling it?”",
  "scenario": "Lorraine, 66, owns 800 shares of a bank stock with a large gain and expects it to drift sideways. She wants extra income but worries about a sharp drop.",
  "prompt": "Explain how writing covered calls would work for her, what she gives up, and how a protective put or a zero-cost collar differs.",
  "points": [
   "Writing calls on owned shares earns a premium she keeps no matter what",
   "If the stock rises above the strike, the shares are called away and gains above the strike are lost",
   "The premium only cushions a small decline; a sharp drop still hurts",
   "A protective put sets a floor but costs a premium and lasts only until expiration",
   "A zero-cost collar pairs a bought put with a written call so the call premium pays for the protection"
  ],
  "source": "apps/fp513-reading.html#alternatives",
  "anchor": "LO 5.2.2 · Using options: speculation, covered calls, protective puts",
  "basis": "FP513 textbook (2026 ed.) — Module 5; original fictional case"
 },
 {
  "id": "fp513-currency",
  "course": "FP513",
  "mod": 5,
  "domain": "D",
  "title": "“My European stocks went up, so why did my statement show almost no gain?”",
  "scenario": "Marco, 45, bought a basket of eurozone shares that rose 8% in euros during a year in which the U.S. dollar strengthened against the euro.",
  "prompt": "Explain how exchange rates changed his dollar return and when currency moves help or hurt a U.S. investor in foreign securities.",
  "points": [
   "His return in dollars depends on both the euro price change and the euro/dollar rate",
   "A stronger dollar converts euro proceeds into fewer dollars, shrinking the return",
   "A U.S. holder of foreign securities benefits when the dollar weakens during the holding period",
   "Show the math: dollar cost at purchase vs. dollar proceeds at sale, then HPR",
   "Currency exposure is part of why foreign holdings diversify; ADRs and funds do not remove it"
  ],
  "source": "apps/fp513-reading.html#alternatives",
  "anchor": "LO 5.5.2 · Exchange rates and dollar returns on foreign securities",
  "basis": "FP513 textbook (2026 ed.) — Module 5; original fictional case"
 },
 {
  "id": "fp513-two-similar-funds",
  "course": "FP513",
  "mod": 6,
  "domain": "D",
  "title": "\"I own two different growth funds from two different companies — aren't I diversified?\"",
  "scenario": "Derek, 45, holds two large-cap growth funds from different fund companies. Each has a correlation of about +0.90 with the S&P 500, and an R-squared near 0.81.",
  "prompt": "Explain why different fund names and managers don't guarantee diversification, and what to look for instead.",
  "points": [
   "Correlation measures how closely two holdings move together; the farther below +1, the more diversification",
   "Both funds track the S&P 500 closely (R-squared about 0.81, above the 0.70 threshold), so they behave almost like one fund",
   "Portfolio standard deviation drops below the weighted average only when correlation is under +1 — the lower, the bigger the drop",
   "Better pairing: keep one and add a fund with a low positive correlation; negative correlation isn't required",
   "Check the two funds' correlation with each other, and remember correlations tend to rise in falling markets"
  ],
  "source": "apps/fp513-reading.html#risk",
  "anchor": "LO 6.2.4 · Covariance, correlation and two-asset portfolio risk",
  "basis": "FP513 textbook (2026 ed.) — Module 6; original fictional case"
 },
 {
  "id": "fp513-low-beta-gold",
  "course": "FP513",
  "mod": 6,
  "domain": "D",
  "title": "\"My gold fund has a beta of 0.4 — so it's my safest holding, right?\"",
  "scenario": "Wen, 58, sees a gold-mining fund with a beta of 0.40 against the S&P 500 but a standard deviation twice the market's, and wants to move her emergency reserve into it.",
  "prompt": "Explain what beta does and doesn't measure, and which risk measure fits this fund.",
  "points": [
   "Beta measures only systematic risk relative to the market: beta = (fund SD ÷ market SD) × correlation",
   "Here the volatility ratio is 2, so a 0.40 beta means a correlation of only 0.20 — the low beta reflects low correlation, not low volatility",
   "R-squared is 0.04, far below 0.70, so beta is unreliable; use standard deviation (total risk) or a gold-index benchmark",
   "Its SD shows it is more volatile than the market — unsuitable for money that must be there in an emergency (liquidity needs belong in cash equivalents)",
   "It may still be a useful diversifier in a small slice because of its low correlation"
  ],
  "source": "apps/fp513-reading.html#risk",
  "anchor": "LO 6.2.1 · Beta and weighted beta",
  "basis": "FP513 textbook (2026 ed.) — Module 6; original fictional case"
 },
 {
  "id": "fp513-twr-dwr",
  "course": "FP513",
  "mod": 7,
  "domain": "D",
  "title": "&ldquo;The fund says it made 16% a year, so why did I only make 15%?&rdquo;",
  "scenario": "Omar bought one share of a stock fund, then bought a second share a year later at a higher price. His statement shows a lower return than the fund's published figure.",
  "prompt": "Explain why the fund's published return and Omar's personal return differ, and which one judges the manager.",
  "points": [
   "Published fund returns are time-weighted: they ignore the investor's own deposits and withdrawals",
   "Omar's return is dollar-weighted (an IRR) and reflects when he added money",
   "He added money right before a weaker year, so his result trails the fund's",
   "The time-weighted figure is the fair way to judge the manager; the dollar-weighted figure shows his own outcome",
   "Neither number is wrong &mdash; they answer different questions"
  ],
  "source": "apps/fp513-reading.html#returns",
  "anchor": "LO 7.1.1 · Time-weighted vs. dollar-weighted return",
  "basis": "FP513 textbook (2026 ed.) — Module 7; original fictional case"
 },
 {
  "id": "fp513-tey",
  "course": "FP513",
  "mod": 7,
  "domain": "D",
  "title": "&ldquo;Why would I take a 4.3% muni when the corporate pays 6%?&rdquo;",
  "scenario": "Felix is in the 32% federal bracket in a state with no income tax and is choosing between a 6% corporate bond and a 4.3% municipal bond of similar quality and maturity.",
  "prompt": "Walk Felix through the taxable equivalent yield and say which bond wins on yield.",
  "points": [
   "Muni interest is free of federal income tax; corporate interest is fully taxable",
   "TEY = 4.3% &divide; (1 &minus; 0.32) = 6.32%, above the corporate's 6%",
   "Cross-check: the corporate keeps 6% &times; 0.68 = 4.08% after tax, below 4.3%",
   "Compare only bonds of similar credit quality and maturity",
   "If his state taxed income and the muni were in-state, the TEY would be even higher"
  ],
  "source": "apps/fp513-reading.html#returns",
  "anchor": "LO 7.4.1 · Taxable equivalent yield (TEY)",
  "basis": "FP513 textbook (2026 ed.) — Module 7; original fictional case"
 },
 {
  "id": "fp513-capm-hurdle",
  "course": "FP513",
  "mod": 8,
  "domain": "D",
  "title": "\"This fund has done great and it's riskier, so shouldn't it beat my 11% target?\"",
  "scenario": "Marisol, 47, wants to buy a fund with a beta of 1.3 because it outperformed last year. She needs 11% to stay on track; T-bills yield 3% and the market is expected to return 8%.",
  "prompt": "Explain how CAPM sets a fair return for the fund's risk and whether it clears her 11% hurdle.",
  "points": [
   "Market risk premium = 8% &minus; 3% = 5%; stock risk premium = 5% &times; 1.3 = 6.5%",
   "CAPM expected return = 3% + 6.5% = 9.5%, below her 11% requirement &rarr; pass",
   "Beta measures only market (systematic) risk; that's the only risk CAPM pays for",
   "Last year's performance doesn't change the required return; if the goal still needs 11%, revisit risk tolerance or the goal itself"
  ],
  "source": "apps/fp513-reading.html#portfolio",
  "anchor": "LO 8.2.1 · CAPM and the security market line",
  "basis": "FP513 textbook (2026 ed.) — Module 8; original fictional case"
 },
 {
  "id": "fp513-crisis-cash",
  "course": "FP513",
  "mod": 8,
  "domain": "D",
  "title": "\"Markets are crashing. Shouldn't we just go to cash until it's over?\"",
  "scenario": "Derek, 39, has a 25-year horizon, an IPS targeting 80/20, and an emergency fund in a money market account. After a pandemic-driven selloff he wants out of stocks.",
  "prompt": "Explain why the plan usually stays put, and what would actually justify changing it.",
  "points": [
   "A pandemic is an exogenous shock; the pain is severe but temporary",
   "His emergency fund already covers short-term needs, so he doesn't have to sell stocks low",
   "Moving to cash risks trading losses and missing the early rebound; markets have a long-term positive bias",
   "Only discontinuous change in his own life (job loss, inheritance, health) calls for rewriting the IPS",
   "Name the bias: vivid crash coverage feeds the availability heuristic"
  ],
  "source": "apps/fp513-reading.html#portfolio",
  "anchor": "LO 8.6.1 · Crisis events and adapting to new norms",
  "basis": "FP513 textbook (2026 ed.) — Module 8; original fictional case"
 },
 {
  "id": "fp513-case-kdx",
  "course": "FP513",
  "mod": 9,
  "domain": "D",
  "title": "Kestrel has made us a fortune. Why should I touch it?",
  "scenario": "Nadia Calloway, 50, holds $360,000 of her employer&rsquo;s stock (about 25% of the family&rsquo;s investments) with a $200,000 gain and resists diversifying.",
  "prompt": "Explain why the position is a risk, what the CAPM says about it, and how she can reduce it without a large tax bill.",
  "points": [
   "Single-company (unsystematic) risk can be diversified away, so the CAPM does not reward it with extra expected return.",
   "CAPM required return 12.4% (4% + 6% &times; 1.40) beats the 11% expected, so the stock does not pay enough for its risk.",
   "An exchange fund diversifies without immediate capital gains tax and keeps the value in the family.",
   "A protective put or a zero-cost collar can set a floor while she decides; the collar caps upside at the call strike.",
   "Selling outright is simple but triggers tax on the $200,000 gain."
  ],
  "source": "apps/fp513-reading.html#case",
  "anchor": "Decision 3 · Allocation and the Kestrel concentration",
  "basis": "FP513 textbook (2026 ed.) — Module 9; original fictional case"
 },
 {
  "id": "fp513-case-taxloc",
  "course": "FP513",
  "mod": 9,
  "domain": "D",
  "title": "Does it really matter which account holds our bonds?",
  "scenario": "Graham Calloway keeps a $60,000 corporate bond fund in the joint brokerage account while his 401(k) is mostly stocks; the couple is in the 32% federal and 5% state brackets.",
  "prompt": "Explain asset placement, the municipal-bond comparison, and the wash-sale trap in plain language.",
  "points": [
   "Interest from the corporate fund is taxed every year as ordinary income in the joint account.",
   "Holding bonds in the 401(k) and stock index funds in the joint account keeps the same mix with less tax.",
   "For new taxable bond money, an in-state muni at 3.6% equals 5.57% taxable for them, beating the 5.2% corporate fund.",
   "Never put municipals in a Roth or IRA; their income is already tax-free.",
   "If they sell a fund at a loss, buying it back within 30 days defers the loss into the new basis."
  ],
  "source": "apps/fp513-reading.html#case",
  "anchor": "Decision 5 · Taxes: wash sales, TEY and placement",
  "basis": "FP513 textbook (2026 ed.) — Module 9; original fictional case"
 }
]);
/* FP513-GEN-END */
