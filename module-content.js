/* Module Hub content — authored, offline, textbook-grounded.
 * Powers the per-module deep-dive on the Modules tab. Loaded before flashcards.js.
 * Exposes window.MODOBJ / MODSYN / MODEX / READER_MAP / TAB_MAP. The Module Hub
 * engine in the app reads these with graceful fallbacks, so adding a course later
 * = add its entries here (no engine change). Keep grounded in FP511/FP512 material.
 *
 *   MODOBJ[course][mod] = ["learning objective", ...]   (self-check checklist)
 *   MODSYN[course][mod] = "how it connects / why it matters" synthesis paragraph
 *   MODEX[course][mod]  = { title, html }  worked example (quantitative modules)
 *   TAB_MAP[course][mod] = reader tab id for deep-linking
 *   READER_MAP[course]   = reader file path
 */
(function () {
  window.READER_MAP = { FP511: 'apps/fp511-reading.html', FP512: 'apps/fp512-reading.html' };

  // module number -> reader tab id (data-tab in the reader)
  window.TAB_MAP = {
    FP511: { 1: 'planning', 2: 'psychology', 3: 'statements', 4: 'tvm', 5: 'conduct', 6: 'economy', 7: 'education', 8: 'casestudy' },
    FP512: { 1: 'principles', 2: 'property', 3: 'life', 4: 'annuities', 5: 'health', 6: 'disability', 7: 'group', 8: 'business' }
  };

  // Per-module infographics (visual study guides). Course -> module -> [{src,title}].
  // GENERATED from assets/infographics/ by scripts/sync_infographics.mjs — do not
  // hand-edit between the markers; add images (named FP###-M#-Title.ext) and re-run.
  /* INFOGRAPHICS-GEN-START */
  window.INFOGRAPHICS = {
      FP512: {
        1: [ { src: 'assets/infographics/FP512-M1-Advanced-Risk-and-Legal-Principles.webp', title: 'Advanced Risk and Legal Principles' }, { src: 'assets/infographics/FP512-M1-Insurance-and-Risk-Management-Guide.webp', title: 'Insurance and Risk Management Guide' } ],
        2: [ { src: 'assets/infographics/FP512-M2-Insurance-Professional-Exam-Quick-Reference.webp', title: 'Insurance Professional Exam Quick Reference' }, { src: 'assets/infographics/FP512-M2-Property-and-Casualty-Exam-Essentials.webp', title: 'Property and Casualty Exam Essentials' }, { src: 'assets/infographics/FP512-M2-Property-and-Casualty-Exam-Guide.webp', title: 'Property and Casualty Exam Guide' } ],
        3: [ { src: 'assets/infographics/FP512-M3-Life-Insurance-Mastery.webp', title: 'Life Insurance Mastery' }, { src: 'assets/infographics/FP512-M3-Life-Insurance-Reference-Guide.webp', title: 'Life Insurance Reference Guide' } ],
        4: [ { src: 'assets/infographics/FP512-M4-Advanced-Annuity-Nuances.webp', title: 'Advanced Annuity Nuances' }, { src: 'assets/infographics/FP512-M4-Annuities-Exam-Quick-Reference.webp', title: 'Annuities Exam Quick Reference' } ],
        5: [ { src: 'assets/infographics/FP512-M5-Health-Coverage-Exam-Quick-Reference.webp', title: 'Health Coverage Exam Quick Reference' }, { src: 'assets/infographics/FP512-M5-Health-and-Government-Insurance-2025-Limits.webp', title: 'Health and Government Insurance 2025 Limits' } ],
        6: [ { src: 'assets/infographics/FP512-M6-DI-LTC-and-Veterans-Rules.webp', title: 'DI LTC and Veterans Rules' }, { src: 'assets/infographics/FP512-M6-Disability-and-Long-Term-Care-Guide.webp', title: 'Disability and Long Term Care Guide' } ],
        7: [ { src: 'assets/infographics/FP512-M7-Employee-Benefits-Taxation-Study-Guide.webp', title: 'Employee Benefits Taxation Study Guide' } ],
        8: [ { src: 'assets/infographics/FP512-M8-Business-Risk-Management-Study-Guide.webp', title: 'Business Risk Management Study Guide' } ]
      }
    };
  /* INFOGRAPHICS-GEN-END */

  // Per-module slide decks (NotebookLM / AI slide PDFs). Course -> module -> [{src,title}].
  // GENERATED from assets/slides/ by scripts/sync_media.mjs — same markers/rules as
  // infographics; PDFs are runtime-cached on first view (not precached — too large).
  /* SLIDES-GEN-START */
  window.SLIDES = {
      FP511: {
        0: [ { src: 'assets/slides/FP511.pdf', title: 'Slide deck' } ]
      },
      FP512: {
        0: [ { src: 'assets/slides/FP512.pdf', title: 'Slide deck' } ],
        1: [ { src: 'assets/slides/FP512-M1-Principles-of-Insurance-and-Risk-Management.pdf', title: 'Principles of Insurance and Risk Management' } ],
        2: [ { src: 'assets/slides/FP512-M2-Property-and-Casualty-Blueprint.pdf', title: 'Property and Casualty Blueprint' } ]
      }
    };
  /* SLIDES-GEN-END */

  // Per-module video overviews (NotebookLM / AI video clips). Course -> module -> [{src,title}].
  // GENERATED from assets/video/ by scripts/sync_media.mjs — same markers/rules as slides;
  // MP4s are runtime-cached on first view (not precached).
  /* VIDEO-GEN-START */
  window.VIDEO = {
      FP512: {
        1: [ { src: 'assets/video/FP512-M1-Principles-of-Insurance.mp4', title: 'Principles of Insurance', dur: 593, cc: 'assets/video/FP512-M1-Principles-of-Insurance.vtt' }, { src: 'assets/video/FP512-M1-Top-4-Insurance-Exam-Traps.mp4', title: 'Top 4 Insurance Exam Traps', dur: 71 } ],
        2: [ { src: 'assets/video/FP512-M2-High-Yield-Property-and-Casualty-Rules.mp4', title: 'High Yield Property and Casualty Rules', dur: 68 }, { src: 'assets/video/FP512-M2-Property-and-Casualty.mp4', title: 'Property and Casualty', dur: 514, cc: 'assets/video/FP512-M2-Property-and-Casualty.vtt' } ],
        3: [ { src: 'assets/video/FP512-M3-CFP-Review-Life-Insurance.mp4', title: 'CFP Review Life Insurance', dur: 635, cc: 'assets/video/FP512-M3-CFP-Review-Life-Insurance.vtt' }, { src: 'assets/video/FP512-M3-High-Yield-Life-Insurance-Review.mp4', title: 'High Yield Life Insurance Review', dur: 73 } ],
        4: [ { src: 'assets/video/FP512-M4-Annuities-CFP-Exam-Review.mp4', title: 'Annuities CFP Exam Review', dur: 547, cc: 'assets/video/FP512-M4-Annuities-CFP-Exam-Review.vtt' }, { src: 'assets/video/FP512-M4-High-Yield-Annuities-Review.mp4', title: 'High Yield Annuities Review', dur: 83 } ],
        5: [ { src: 'assets/video/FP512-M5-Health-Insurance-Review.mp4', title: 'Health Insurance Review', dur: 515, cc: 'assets/video/FP512-M5-Health-Insurance-Review.vtt' }, { src: 'assets/video/FP512-M5-High-Yield-COBRA-Timelines.mp4', title: 'High Yield COBRA Timelines', dur: 71 } ],
        6: [ { src: 'assets/video/FP512-M6-Cracking-DI-and-LTC.mp4', title: 'Cracking DI and LTC', dur: 486, cc: 'assets/video/FP512-M6-Cracking-DI-and-LTC.vtt' }, { src: 'assets/video/FP512-M6-High-Yield-Disability-and-LTC-Rules.mp4', title: 'High Yield Disability and LTC Rules', dur: 69 } ],
        7: [ { src: 'assets/video/FP512-M7-Employee-Benefits-Review.mp4', title: 'Employee Benefits Review', dur: 485, cc: 'assets/video/FP512-M7-Employee-Benefits-Review.vtt' } ]
      }
    };
  /* VIDEO-GEN-END */

  // Per-module audio "podcasts" (NotebookLM Audio Overviews — natural-voice deep dives).
  // Course -> module -> [{src,title}]; module 0 = whole-course. GENERATED from assets/audio/
  // by scripts/sync_media.mjs (same markers/rules as video). M4A/MP3 are runtime-cached on
  // first play (not precached). Surfaced as a 🎧 Podcast card in the Module Hub.
  /* AUDIO-GEN-START */
  window.AUDIO = {
      FP511: {
        0: [ { src: 'assets/audio/FP511-Full-Course-Exam-Review.m4a', title: 'Full Course Exam Review', dur: 3119 } ]
      },
      FP512: {
        0: [ { src: 'assets/audio/FP512-Full-Course-Exam-Review.m4a', title: 'Full Course Exam Review', dur: 3430 } ],
        1: [ { src: 'assets/audio/FP512-M1-Principles-of-Insurance-and-Risk-Management.m4a', title: 'Principles of Insurance and Risk Management', dur: 1276 } ],
        2: [ { src: 'assets/audio/FP512-M2-Property-and-Casualty.m4a', title: 'Property and Casualty', dur: 1477 } ],
        3: [ { src: 'assets/audio/FP512-M3-Life-Insurance.m4a', title: 'Life Insurance', dur: 1447 } ],
        4: [ { src: 'assets/audio/FP512-M4-Annuities.m4a', title: 'Annuities', dur: 1255 } ],
        5: [ { src: 'assets/audio/FP512-M5-Health-Insurance.m4a', title: 'Health Insurance', dur: 1424 } ],
        6: [ { src: 'assets/audio/FP512-M6-Disability-and-Long-Term-Care.m4a', title: 'Disability and Long Term Care', dur: 1466 } ],
        7: [ { src: 'assets/audio/FP512-M7-Group-Benefits-and-Taxation.m4a', title: 'Group Benefits and Taxation', dur: 1430 } ],
        8: [ { src: 'assets/audio/FP512-M8-Business-Uses-of-Insurance.m4a', title: 'Business Uses of Insurance', dur: 1508 } ]
      }
    };
  /* AUDIO-GEN-END */

  // ---- Visual slide DECKS (native HTML, not PDF) -------------------------------
  // Course -> module -> [{src, title, kind}] where kind is 'kaplan' (official
  // College for Financial Planning / Kaplan course slides) or 'ai' (NotebookLM
  // AI-generated decks). These are standalone responsive HTML pages in apps/,
  // opened full-screen via openDeck() (like the Interactive Readers) — NOT the
  // old PDF iframe viewer (window.SLIDES). Module 0 = whole-course deck, shown on
  // the Modules-tab course card. HAND-AUTHORED (not generated) — add a course's
  // module deck by dropping the apps/*.html file and adding an entry here.
  window.DECKS = {
    FP511: {
      0: [ { src: 'apps/fp511-ai-slides.html', title: 'High-yield exam review', kind: 'ai' } ],
      2: [ { src: 'apps/fp511-m2-kaplan-slides.html', title: 'Psychology of Financial Planning',     kind: 'kaplan' } ],
      4: [ { src: 'apps/fp511-m4-kaplan-slides.html', title: 'Time Value of Money',                  kind: 'kaplan' } ],
      5: [ { src: 'apps/fp511-m5-kaplan-slides.html', title: 'Professional Conduct & Fiduciary',     kind: 'kaplan' } ],
      6: [ { src: 'apps/fp511-m6-kaplan-slides.html', title: 'Economic Environment & Consumer Protection', kind: 'kaplan' } ],
      7: [ { src: 'apps/fp511-m7-kaplan-slides.html', title: 'Education Planning',                   kind: 'kaplan' } ]
    },
    FP512: {
      0: [ { src: 'apps/fp512-ai-slides.html', title: 'High-yield exam review', kind: 'ai' } ],
      1: [ { src: 'apps/fp512-m1-kaplan-slides.html', title: 'Principles of Insurance & Risk Mgmt', kind: 'kaplan' },
           { src: 'apps/fp512-m1-ai-slides.html',    title: 'AI deep-dive',                        kind: 'ai' } ],
      2: [ { src: 'apps/fp512-m2-kaplan-slides.html', title: 'Property & Casualty Insurance',       kind: 'kaplan' },
           { src: 'apps/fp512-m2-ai-slides.html',    title: 'AI deep-dive',                        kind: 'ai' } ],
      3: [ { src: 'apps/fp512-m3-kaplan-slides.html', title: 'Life Insurance',                      kind: 'kaplan' } ],
      4: [ { src: 'apps/fp512-m4-kaplan-slides.html', title: 'Annuities',                           kind: 'kaplan' } ],
      5: [ { src: 'apps/fp512-m5-kaplan-slides.html', title: 'Health, Medicare & Medicaid',         kind: 'kaplan' } ],
      6: [ { src: 'apps/fp512-m6-kaplan-slides.html', title: 'Disability, LTC & Veterans',          kind: 'kaplan' } ],
      7: [ { src: 'apps/fp512-m7-kaplan-slides.html', title: 'Employee Group Benefits',             kind: 'kaplan' } ],
      8: [ { src: 'apps/fp512-m8-kaplan-slides.html', title: 'Business Owner Risk',                 kind: 'kaplan' } ]
    },
    FP513: {
      // Claude-built from the app's own FP513 notes (scripts/build_fp513_deck.mjs) — no NotebookLM/Kaplan source yet
      0: [ { src: 'apps/fp513-ai-slides.html', title: 'High-yield exam review', kind: 'ai' } ]
    }
  };

  window.MODOBJ = {
    FP511: {
      1: [
        "Recite the 7-step financial planning process in order and what happens in each step",
        "Distinguish the planner's responsibilities at engagement, data-gathering, and implementation",
        "Identify required disclosures and which must be in writing",
        "Place a client in the correct financial life-cycle phase and adjust advice accordingly",
        "Explain what to do when client information is incomplete"
      ],
      2: [
        "Recognize common behavioral biases (anchoring, overconfidence, recency, loss aversion, framing)",
        "Explain money scripts and how upbringing shapes financial behavior",
        "Apply counseling/communication techniques and active listening to client meetings",
        "Adapt planning around life transitions, crisis events, and client resistance"
      ],
      3: [
        "Build a statement of financial position and classify assets vs. liabilities correctly",
        "Construct a cash-flow statement and separate fixed vs. variable (discretionary) outflows",
        "Compute and interpret the core ratios (emergency fund, savings rate, debt, housing)",
        "Recommend an appropriate emergency-fund target from the client's expenses"
      ],
      4: [
        "Solve FV/PV problems for single sums and for ordinary annuities vs. annuities due",
        "Convert a nominal return and inflation into the real (inflation-adjusted) rate",
        "Evaluate cash flows with NPV and IRR and apply the NPV decision rule",
        "Set the calculator to the right payment mode (BEG vs. END) for the fact pattern",
        "Compute a serial payment that keeps pace with inflation"
      ],
      5: [
        "State the duties owed to clients, firms, the public, and CFP Board",
        "Apply the fiduciary duty (duty of loyalty, care, and to follow client instructions)",
        "Match a fact pattern to the Standard of Conduct it violates",
        "Trace the CFP Board enforcement/discipline process and possible sanctions"
      ],
      6: [
        "Identify the phases of the business cycle and where the economy sits",
        "Distinguish monetary policy (the Fed) from fiscal policy (Congress) and their tools",
        "Explain how interest rates, inflation, and the yield curve relate",
        "Recognize the major consumer-protection laws and what each covers"
      ],
      7: [
        "Run the two-step education funding calc: PV of the need today, then required savings",
        "Compare 529 plans, Coverdell ESAs, UTMA/UGMA, and savings bonds on tax & control",
        "Apply the American Opportunity and Lifetime Learning credits and their phaseouts",
        "Account for financial-aid treatment of parent- vs. student-owned assets"
      ],
      8: [
        "Integrate insurance, tax, investment, retirement, and estate issues in one case",
        "Identify which domains a fact pattern touches before answering",
        "Prioritize recommendations by client goal and risk exposure"
      ]
    },
    FP512: {
      1: [
        "Define risk, peril, and hazard and distinguish the hazard types (physical/moral/morale)",
        "List the requisites of an insurable risk and the role of the law of large numbers",
        "Explain indemnity, adverse selection, and how insurers control it",
        "Apply contract-law elements: offer/acceptance, insurable interest, utmost good faith, adhesion"
      ],
      2: [
        "Match an HO form to the perils and property it covers (HO-2/3/5/4/6/8)",
        "Apply the coinsurance formula to compute a partial-loss recovery",
        "Identify Personal Auto Policy coverages (liability, med pay, UM/UIM, collision, comprehensive)",
        "Explain when an umbrella policy responds and its underlying-limit requirement"
      ],
      3: [
        "Compare term vs. permanent and whole/universal/variable life on cost, cash value, and risk",
        "Quantify need using the human-life-value and needs (capital-retention) approaches",
        "Apply key policy provisions, dividend options, and common riders",
        "State the income-tax treatment of death benefits, cash-value growth, and policy loans"
      ],
      4: [
        "Distinguish deferred vs. immediate and fixed vs. variable annuities",
        "Compute the exclusion ratio and the taxable portion of annuity payments",
        "Compare payout options (life-only, period certain, joint-and-survivor)",
        "Apply annuity taxation (LIFO on withdrawals, 10% penalty) and the 1035 exchange"
      ],
      5: [
        "Compare HMO, PPO, POS, and HDHP plan designs and cost-sharing",
        "Apply HSA eligibility, contribution limits, and triple-tax advantage",
        "Explain COBRA and ACA rights and timelines",
        "Map Medicare Parts A/B/C/D and the Medicaid spend-down / long-term-care role"
      ],
      6: [
        "Rank disability definitions from own-occ to any-occ to Social Security",
        "Apply elimination and benefit periods to a DI fact pattern",
        "State the taxation of DI benefits based on who paid the premium",
        "Identify when LTC insurance and veterans benefits apply"
      ],
      7: [
        "Compute Section 79 imputed income on group term life over $50,000",
        "Explain cafeteria (Section 125) plans, FSAs, and the use-it-or-lose-it rule",
        "Apply nondiscrimination rules for group benefits",
        "Compare group vs. individual coverage on cost, portability, and underwriting"
      ],
      8: [
        "Compare cross-purchase vs. entity-purchase buy-sell agreements and their tax/basis effects",
        "Size key-person coverage and explain its purpose",
        "Structure business-continuation and split-dollar arrangements",
        "Match a business risk to the appropriate insurance solution"
      ]
    }
  };

  window.MODSYN = {
    FP511: {
      1: "This module is the skeleton every other topic hangs on: the 7-step process (Understand circumstances → Identify goals → Analyze → Develop recommendations → Present → Implement → Monitor) is the order the exam expects, and the duties you take on at each step come straight from the fiduciary standard you'll study in Module 5. Get the process and disclosure rules cold — they recur in scenario questions across all domains.",
      2: "Psychology is the 'why clients don't act' layer over the technical plan. Biases and money scripts explain resistance you'll see in case studies, and the communication techniques here are how you implement the recommendations from Module 1. Small weight on the blueprint, but it shows up inside cross-domain scenarios.",
      3: "Financial statements turn a client's situation into numbers you can plan with. The position statement and cash-flow statement feed every later recommendation — emergency fund sizing, debt ratios, and how much is available to save (which becomes the PMT in your Module 4 TVM work). Master the ratios; they're quick points.",
      4: "Time value of money is the engine of the entire CFP exam — education funding, retirement need, bond pricing, and lump-sum vs. annuity decisions are all TVM in disguise. The two things that trip people up are BEG vs. END mode and using the real (inflation-adjusted) rate; nail those and a huge share of calculation questions fall.",
      5: "Conduct and fiduciary duty is non-negotiable exam material and the ethical backbone of Module 1's process. Know the duties owed, the Standards, and the discipline process verbatim — these questions reward precise recall, not estimation, and they appear in every form of the exam.",
      6: "The economic environment sets the backdrop for investment and retirement planning: where we are in the business cycle and what the Fed is doing drives interest rates and asset returns. Pair this with the consumer-protection laws, which are recall-style points.",
      7: "Education planning is the cleanest application of Module 4's TVM: solve for the lump sum needed today (PV in BEG mode at the inflation-adjusted rate), then for the savings required to get there. Layer on the 529/Coverdell/credit rules and financial-aid asset treatment — a frequently tested, high-yield combination.",
      8: "The case study is where the other seven modules meet. The skill being tested is triage: read the fact pattern, name the domains it touches, and prioritize. Practice identifying overlaps (tax + estate, insurance + retirement) rather than memorizing new material."
    },
    FP512: {
      1: "Everything in insurance planning rests on these fundamentals. Risk/peril/hazard vocabulary, the requisites of an insurable risk, and contract-law elements (insurable interest, utmost good faith, adhesion) are the definitions the rest of the course applies. Adverse selection and indemnity explain why policies are designed the way they are.",
      2: "Property & casualty is where the coinsurance formula lives — the single most tested P&C calculation. Tie the HO forms to what they cover and remember auto/umbrella layering. The recovery math here is the same proportional logic you'll reuse elsewhere.",
      3: "Life insurance combines product knowledge with needs analysis. The two methods (human life value vs. needs approach) answer 'how much,' while the product comparison answers 'what kind.' The taxation rules — tax-free death benefit, tax-deferred cash value, basis-first loans — recur in estate and tax planning.",
      4: "Annuities are the mirror image of life insurance: they protect against living too long. The exclusion ratio (basis ÷ expected return) is the key calc, and the taxation rules (LIFO, 10% penalty, 1035 exchange) connect directly to retirement-income planning in FP515.",
      5: "Health coverage is mostly rules and acronyms, but the HSA triple-tax advantage and the Medicare A/B/C/D map are reliably tested. Keep COBRA/ACA timelines straight and understand Medicaid's spend-down role for long-term care, which links to Module 6.",
      6: "Disability and LTC protect human capital — the asset behind every other plan. The own-occ → any-occ definition ladder and the premium-paid-by-whom taxation rule are the two highest-yield ideas. Veterans benefits round out the safety-net picture.",
      7: "Group benefits is where insurance meets employee-benefits tax law. Section 79 imputed income on group term life over $50,000 is the signature calculation; cafeteria plans and FSAs add the tax-advantaged wrappers. Nondiscrimination rules decide whether the favorable tax treatment survives.",
      8: "Business risk solutions apply individual products to business problems: buy-sell agreements fund ownership transfers, key-person insurance offsets the loss of talent, and split-dollar shares premium and benefit. The cross-purchase vs. entity distinction (and its basis consequences) is the part most often tested."
    }
  };

  window.MODEX = {
    FP511: {
      3: {
        title: "Worked example — emergency fund & savings ratio",
        html: "<p><b>Facts:</b> A client has $6,000/month in non-discretionary (fixed) expenses, $9,000 gross monthly income, and $18,000 in liquid savings.</p>" +
              "<ol><li><b>Emergency-fund months</b> = liquid savings ÷ monthly fixed expenses = $18,000 ÷ $6,000 = <b>3.0 months</b>. The 3–6 month guideline says this is at the low end — recommend building toward 4–6 months.</li>" +
              "<li><b>Savings rate</b> = amount saved ÷ gross income. If they save $900/month, that's $900 ÷ $9,000 = <b>10%</b>, a reasonable baseline before retirement-specific targets.</li></ol>" +
              "<p class='small muted'>Watch the denominator: emergency fund uses <i>fixed</i> expenses, savings rate uses <i>gross</i> income.</p>"
      },
      4: {
        title: "Worked example — real rate then future value",
        html: "<p><b>Facts:</b> Expected return 8%, inflation 3%, investing $10,000 today for 20 years.</p>" +
              "<ol><li><b>Real (inflation-adjusted) rate</b> = [(1.08 ÷ 1.03) − 1] × 100 = <b>4.854%</b>. (Don't just subtract — that overstates it.)</li>" +
              "<li><b>FV in today's dollars</b> = $10,000 × (1.04854)^20 ≈ <b>$25,900</b>. Using the nominal 8% instead would answer a different question (future nominal dollars, ≈ $46,600).</li></ol>" +
              "<p class='small muted'>Education and retirement 'need' problems almost always want the real rate.</p>"
      },
      7: {
        title: "Worked example — two-step education funding",
        html: "<p><b>Facts:</b> College starts in 10 years, costs $30,000/yr (today's dollars) for 4 years, education inflation 5%, portfolio earns 7%.</p>" +
              "<ol><li><b>Step 1 — lump sum needed at matriculation (Day 1 of college):</b> treat the 4 tuition payments as an annuity <b>due</b> and discount at the inflation-adjusted rate [(1.07÷1.05)−1 = 1.905%]. PV(BEG) of $30,000 ×4 ≈ <b>$116,500</b> in today's dollars.</li>" +
              "<li><b>Step 2 — save for that lump sum:</b> solve for the PMT that grows to the Step-1 figure over 10 years at 7%. This is the recurring trap: Step 1 solves a <b>PV</b>, not a future value.</li></ol>" +
              "<p class='small muted'>BEG mode in Step 1 because the first tuition bill is due immediately when college begins.</p>"
      }
    },
    FP512: {
      1: {
        title: "Worked example — is the risk insurable?",
        html: "<p>Run a risk through the requisites of an <b>insurable risk</b>:</p>" +
              "<ul><li>Large number of similar exposure units (law of large numbers) ✔</li>" +
              "<li>Loss is definite, measurable, and accidental (not intentional) ✔</li>" +
              "<li>Loss is not catastrophic to the insurer ✔</li>" +
              "<li>Premium is economically feasible; chance of loss calculable ✔</li>" +
              "<li>Insurable interest exists at the right time</li></ul>" +
              "<p>If any fail (e.g., a near-certain or intentional loss), it's not insurable. <b>Insurable interest</b> timing: required at <i>policy inception</i> for life insurance, at the <i>time of loss</i> for property insurance.</p>"
      },
      3: {
        title: "Worked example — human life value vs. needs approach",
        html: "<p><b>Facts:</b> Age 40, earns $80,000, will work 25 more years; family needs $60,000/yr income, has $200,000 assets and $150,000 existing coverage.</p>" +
              "<ol><li><b>Human life value</b> = PV of future earnings devoted to the family. Discount the income stream over the work-life — a larger, income-replacement figure.</li>" +
              "<li><b>Needs approach</b> = capital needed to fund survivor income + final expenses + debts − existing resources. Roughly: capital to throw off $60,000/yr, plus debts, minus $200,000 assets and $150,000 coverage = the <b>additional</b> insurance to buy.</li></ol>" +
              "<p class='small muted'>The needs approach is usually the exam's preferred method; human-life-value sets an upper bound.</p>"
      },
      4: {
        title: "Worked example — annuity exclusion ratio",
        html: "<p><b>Facts:</b> $100,000 basis (after-tax investment), expected total return $150,000 over the payout.</p>" +
              "<ol><li><b>Exclusion ratio</b> = basis ÷ expected return = $100,000 ÷ $150,000 = <b>66.7%</b> of each payment is tax-free return of basis.</li>" +
              "<li>The remaining <b>33.3%</b> is taxable as ordinary income — until total basis is recovered, after which payments are fully taxable.</li></ol>" +
              "<p class='small muted'>Contrast with non-annuitized withdrawals, which are taxed LIFO (gain first) plus a 10% penalty before 59½.</p>"
      },
      7: {
        title: "Worked example — Section 79 imputed income",
        html: "<p><b>Facts:</b> Employer provides $150,000 of group term life; employee is age 45 (Table I rate $0.15 per $1,000 per month).</p>" +
              "<ol><li>Only coverage <b>over $50,000</b> is taxable: $150,000 − $50,000 = <b>$100,000</b> excess.</li>" +
              "<li>Annual imputed income = ($100,000 ÷ $1,000) × $0.15 × 12 = <b>$180</b> added to W-2 wages (less any after-tax premiums the employee pays).</li></ol>" +
              "<p class='small muted'>The first $50,000 of employer-provided group term life is always tax-free to the employee.</p>"
      }
    }
  };

  // Exam cheat-sheet content (printable) — key numbers, must-know rules, traps, tips.
  // keyNumbers = [["label","detail"], ...]. Case Study is intentionally lighter.
  window.MODCHEAT = {
    FP511: {
      1: {
        keyNumbers: [
          ["7 steps","Understand → Identify goals → Analyze → Recommend → Present → Implement → Monitor"],
          ["Fiduciary","Duty of Loyalty + Care + Follow client instructions — at all times when advising"],
          ["Written disclosures","Material conflicts, compensation, and the scope of engagement"],
          ["Life-cycle","Accumulation → Conservation → Distribution"]
        ],
        mustKnow: [
          "Know the <b>7-step process in order</b> — it frames nearly every scenario question.",
          "A CFP® professional is a <b>fiduciary at all times</b> when providing financial advice.",
          "Define the <b>scope of engagement</b> and disclose conflicts before proceeding.",
          "If information is <b>incomplete</b>, you may continue with the client's permission, noting the limitation."
        ],
        traps: [
          "Re-ordering the steps — <b>Analyze</b> comes before <b>developing recommendations</b>.",
          "Thinking fiduciary duty applies only to investments — it covers <b>all</b> financial advice.",
          "Skipping <b>monitoring</b> (Step 7) — the process is ongoing, not one-and-done."
        ],
        tips: [
          "'What is the planner's NEXT step?' → locate where you are in the 7-step process.",
          "Conflict-of-interest language → disclosure + fiduciary duty is the answer."
        ]
      },
      2: {
        keyNumbers: [
          ["Biases","Anchoring, overconfidence, recency, loss aversion, framing, herding"],
          ["Money scripts","Avoidance, worship, status, vigilance (Klontz)"],
          ["Loss aversion","Losses feel ~2× as painful as equivalent gains"],
          ["Tolerance vs capacity","Willingness to take risk vs ability to absorb loss"]
        ],
        mustKnow: [
          "<b>Behavioral biases</b> explain why clients act against their own plan.",
          "<b>Money scripts</b> are money beliefs formed early in life.",
          "Use <b>active listening</b>, open-ended questions, and empathy in counseling.",
          "<b>Loss aversion</b> makes clients hold losers and sell winners."
        ],
        traps: [
          "Confusing <b>risk tolerance</b> (willingness) with <b>risk capacity</b> (ability).",
          "Mislabeling a bias — <b>anchoring</b> (fixating on a reference) vs <b>recency</b> (overweighting recent events)."
        ],
        tips: [
          "Emotional/irrational money decision in the stem → name the <b>bias</b>.",
          "'Won't sell a losing stock' → <b>loss aversion</b> / anchoring."
        ]
      },
      3: {
        keyNumbers: [
          ["Emergency fund","3–6 months of nondiscretionary (fixed) expenses"],
          ["Housing ratio","≤ 28% of gross income (PITI)"],
          ["Total debt ratio","≤ 36% of gross income (PITI + other debt)"],
          ["Savings rate","Target ~10–20% of gross income"],
          ["Net worth","Assets − Liabilities (statement of financial position)"]
        ],
        mustKnow: [
          "<b>Statement of financial position</b> = assets vs liabilities at a point in time.",
          "<b>Cash-flow statement</b> = inflows vs outflows over a period; split fixed vs discretionary.",
          "Emergency fund uses <b>fixed</b> expenses; debt ratios use <b>gross</b> income.",
          "Assets are shown at <b>fair market value</b>, liabilities at outstanding balance."
        ],
        traps: [
          "Emergency fund off <b>total</b> expenses instead of <b>fixed/nondiscretionary</b>.",
          "Using <b>net</b> income for the 28/36 ratios — they use <b>gross</b>.",
          "Listing an asset's <b>original cost</b> instead of current FMV."
        ],
        tips: [
          "Ratio question → check the <b>denominator</b> (gross income vs fixed expenses)."
        ]
      },
      4: {
        keyNumbers: [
          ["Real rate","[(1+nominal) ÷ (1+inflation) − 1] — don't just subtract"],
          ["BEG vs END","Annuity due (BEG) = payments at start; ordinary (END) = at end"],
          ["Rule of 72","Years to double ≈ 72 ÷ rate"],
          ["NPV rule","Accept if NPV ≥ 0 (IRR ≥ required return)"],
          ["Serial payment","Grows with inflation; first payment = PMT × (1+inflation)"]
        ],
        mustKnow: [
          "Education & retirement 'need' problems use the <b>real (inflation-adjusted) rate</b>.",
          "Set <b>BEG mode</b> when the first cash flow is today (annuity due).",
          "<b>NPV</b> discounts at the required return; <b>IRR</b> solves the rate where NPV = 0.",
          "More frequent compounding → higher <b>effective</b> rate."
        ],
        traps: [
          "Subtracting inflation from return instead of the <b>real-rate formula</b>.",
          "Leaving the calculator in <b>END</b> mode for an annuity-due problem.",
          "Confusing <b>nominal</b> vs <b>effective</b> rate with non-annual compounding."
        ],
        tips: [
          "'In today's dollars' / 'inflation-adjusted' → use the <b>real rate</b>.",
          "First payment due immediately → <b>BEG</b> mode."
        ]
      },
      5: {
        keyNumbers: [
          ["Duties owed","Client, Firm, Public, and CFP Board"],
          ["Fiduciary","Loyalty + Care + Follow Client Instructions"],
          ["Material conflict","Disclose AND manage; obtain client consent (often written)"],
          ["Discipline","Private censure → public letter → suspension → revocation"]
        ],
        mustKnow: [
          "A CFP® professional is a <b>fiduciary at all times</b> when giving financial advice.",
          "<b>Duty of Loyalty</b>: client first, avoid/disclose/manage conflicts, no misuse of info.",
          "Know the <b>Standards of Conduct</b> and the duties owed to each party.",
          "Sanctions escalate from <b>private censure</b> to <b>revocation</b> of the marks."
        ],
        traps: [
          "Thinking disclosure <b>alone</b> cures a conflict — it must also be <b>managed</b> + consented.",
          "Applying fiduciary duty only to investment advice — it's <b>all</b> financial advice.",
          "Confusing the three fiduciary duties (loyalty / care / instructions)."
        ],
        tips: [
          "Conflict scenario → usually <b>disclose, obtain consent, manage</b>.",
          "When unsure, the <b>most client-protective</b> answer is typically correct."
        ]
      },
      6: {
        keyNumbers: [
          ["Business cycle","Expansion → Peak → Contraction → Trough"],
          ["Monetary policy","The Fed: open-market ops, discount rate, reserve requirements"],
          ["Fiscal policy","Congress: taxing & spending"],
          ["Yield curve","Normal = upward; inverted often precedes recession"],
          ["Key laws","TILA, FCRA, ECOA, Fair Debt Collection"]
        ],
        mustKnow: [
          "<b>Monetary</b> policy = the Fed (rates/money supply); <b>fiscal</b> = Congress (tax/spend).",
          "The Fed <b>raises</b> rates to fight inflation, <b>lowers</b> to stimulate.",
          "An <b>inverted yield curve</b> is a classic recession signal.",
          "Consumer laws: <b>FCRA</b> (credit reports), <b>ECOA</b> (no discrimination), <b>TILA</b> (disclosure)."
        ],
        traps: [
          "Attributing <b>open-market operations</b> to Congress (it's the Fed).",
          "Mixing up which <b>consumer-protection law</b> covers what."
        ],
        tips: [
          "'Fed' in the stem → <b>monetary</b> policy; 'Congress/tax' → <b>fiscal</b>."
        ]
      },
      7: {
        keyNumbers: [
          ["Two-step","Step 1: PV of need (BEG, real rate) · Step 2: solve required savings (PMT)"],
          ["529 plan","Tax-free growth for qualified education; owner-controlled; high limits"],
          ["Coverdell ESA","$2,000/yr; K-12 + college; income phaseouts"],
          ["AOTC","Up to $2,500/yr, first 4 years, 40% refundable; phaseouts"],
          ["LLC","Up to $2,000/yr; unlimited years; nonrefundable"],
          ["Aid impact","Parent-owned assets assessed lighter than student-owned"]
        ],
        mustKnow: [
          "<b>Step 1 solves a PRESENT VALUE</b> (lump sum at matriculation), not a future value.",
          "Use <b>BEG mode</b> + the <b>inflation-adjusted rate</b> for the funding annuity.",
          "<b>529</b>: owner keeps control; <b>UTMA/UGMA</b>: irrevocable gift to the child.",
          "<b>AOTC</b> (4 yrs, partly refundable) vs <b>LLC</b> (unlimited yrs, nonrefundable) — no double-dipping."
        ],
        traps: [
          "Solving Step 1 as a <b>future value</b> — it's a <b>PV</b> (one of the most-missed items).",
          "Claiming AOTC and LLC for the <b>same student</b> in the same year.",
          "Forgetting <b>student-owned</b> assets hurt financial aid more than parent-owned."
        ],
        tips: [
          "Education funding → <b>PV in BEG mode at the real rate</b>, then solve the savings PMT."
        ]
      },
      8: {
        mustKnow: [
          "Read the <b>full fact pattern</b> first and note which <b>domains</b> it touches.",
          "Identify <b>cross-domain overlaps</b>: estate+tax, insurance+retirement, investment+tax.",
          "Prioritize by the client's stated <b>goals</b> and biggest <b>risk exposures</b>.",
          "Translate concepts into <b>actions</b> — the exam asks 'what should the planner DO?'"
        ],
        tips: [
          "List the <b>domains in play</b> before answering — it narrows the options fast.",
          "Form your <b>own answer</b> before reading the choices; distractors are designed to mislead.",
          "No guessing penalty — <b>flag, guess, move on</b>, and manage your time.",
          "Ethics and the 7-step process show up inside cases — apply them explicitly."
        ]
      }
    },
    FP512: {
      1: {
        keyNumbers: [
          ["Risk / peril / hazard","Risk = uncertainty · peril = cause of loss · hazard = increases chance/severity"],
          ["Hazard types","Physical · Moral (dishonesty) · Morale (carelessness)"],
          ["Insurable risk","Large pool, definite/measurable, accidental, non-catastrophic, calculable, affordable"],
          ["Insurable interest","Life: at INCEPTION · Property: at TIME OF LOSS"],
          ["Adverse selection","Controlled via underwriting, exclusions, riders, pricing"]
        ],
        mustKnow: [
          "<b>Indemnity</b>: restore the insured to pre-loss condition — no profit from a loss.",
          "Contract traits: <b>adhesion</b>, <b>utmost good faith</b>, <b>aleatory</b>, <b>unilateral</b>, conditional.",
          "<b>Law of large numbers</b>: bigger pools make losses more predictable.",
          "Insurable-interest timing differs: <b>life at inception, property at loss</b>."
        ],
        traps: [
          "Mixing up <b>moral</b> (dishonesty) vs <b>morale</b> (carelessness) hazard.",
          "Saying property insurable interest must exist at <b>inception</b> — it's at <b>time of loss</b>.",
          "Treating insurance as a way to <b>profit</b> — indemnity prevents that."
        ],
        tips: [
          "'Cause of loss' → <b>peril</b>; 'condition that increases loss' → <b>hazard</b>.",
          "Policy ambiguity is construed <b>against the insurer</b> (adhesion)."
        ]
      },
      2: {
        keyNumbers: [
          ["Coinsurance","Payment = (Carried ÷ Required[usually 80% of RC]) × Loss − deductible"],
          ["HO-3","Open perils dwelling / named perils contents (most common)"],
          ["HO-4 / HO-6","Renters / condo unit-owners"],
          ["PAP","Liability, Med Pay, UM/UIM, Collision, Comprehensive"],
          ["Umbrella","Excess liability above auto/home; requires underlying limits"]
        ],
        mustKnow: [
          "<b>Coinsurance</b> penalizes insuring below the required % (usually 80% of replacement cost).",
          "<b>HO-3</b> = open perils on the dwelling, named perils on contents.",
          "Auto <b>collision</b> = your car in a crash; <b>comprehensive</b> = theft, fire, weather, animals.",
          "An <b>umbrella</b> needs minimum underlying limits before it responds."
        ],
        traps: [
          "Forgetting to <b>subtract the deductible</b> after the coinsurance calc.",
          "Calling theft/weather damage 'collision' — that's <b>comprehensive</b>.",
          "Assuming flood/earthquake is covered by a standard HO policy — it's <b>excluded</b>."
        ],
        tips: [
          "Coinsurance: <b>(did ÷ should) × loss − deductible</b>; cap the payout at the loss amount."
        ]
      },
      3: {
        keyNumbers: [
          ["Human life value","PV of future earnings devoted to the family"],
          ["Needs approach","Capital + final expenses + debts − existing resources (exam-preferred)"],
          ["Death benefit","Income-tax-FREE to the beneficiary"],
          ["Cash value","Grows tax-deferred; loans tax-free (basis first) unless lapse/MEC"],
          ["MEC","Fails 7-pay test → withdrawals/loans taxed LIFO + 10% penalty"]
        ],
        mustKnow: [
          "Term = pure protection; <b>whole</b> = guaranteed; <b>universal</b> = flexible; <b>variable</b> = subaccounts (a security).",
          "Death benefit is <b>income-tax-free</b>; cash value grows <b>tax-deferred</b>.",
          "<b>Needs approach</b> is usually exam-preferred; HLV sets an upper bound.",
          "A <b>MEC</b> loses favorable loan/withdrawal tax treatment."
        ],
        traps: [
          "Saying cash-value <b>growth</b> or policy <b>loans</b> are taxable (they aren't, absent lapse/MEC).",
          "Confusing <b>HLV</b> (income replacement) with the <b>needs</b> approach.",
          "Forgetting <b>variable</b> life = a security needing a prospectus."
        ],
        tips: [
          "'How much insurance?' → usually the <b>needs approach</b>.",
          "Variable/registered product cue → suitability + prospectus."
        ]
      },
      4: {
        keyNumbers: [
          ["10% penalty","Early withdrawal before age 59½ (nonqualified gains)"],
          ["Exclusion ratio","Investment (basis) ÷ Expected total return"],
          ["LIFO","Nonqualified withdrawals taxed gains-first (ordinary income)"],
          ["1035 exchange","Annuity→Annuity ✔ · Life→Annuity ✔ · Annuity→Life ✘"],
          ["RMDs","Qualified annuities only; none for nonqualified in accumulation"],
          ["~70%","of buyers choose the GLWB living-benefit rider"]
        ],
        mustKnow: [
          "Annuity = protection against <b>living too long</b> (longevity) — the mirror of life insurance.",
          "Tax-<b>deferred</b> growth; premiums <b>not deductible</b> (after-tax basis if nonqualified).",
          "Payouts: <b>life-only</b> = highest, nothing to heirs → period-certain → <b>joint &amp; survivor</b> = lowest.",
          "<b>Variable</b> = a security (prospectus + FINRA); <b>fixed</b> = insurance; <b>indexed/EIA</b> = NOT a security."
        ],
        traps: [
          "1035 from an annuity <b>into life insurance</b> — <b>not allowed</b> (one-way toward annuities).",
          "Mixing the <b>exclusion ratio</b> (annuitized) with <b>LIFO</b> (pre-annuitization withdrawals).",
          "Annuity <b>death benefit is NOT income-tax-free</b> like life insurance — the gain is taxable.",
          "Applying <b>RMDs</b> to a nonqualified annuity during accumulation."
        ],
        tips: [
          "Client fears <b>outliving money</b> → annuity (longevity), never life insurance.",
          "'Max monthly income, no heirs' → <b>straight life</b> annuity.",
          "Spot the <b>tax wrapper first</b> (qualified vs nonqualified) — it drives RMD &amp; basis."
        ]
      },
      5: {
        keyNumbers: [
          ["HSA","Requires an HDHP; triple-tax-advantaged"],
          ["COBRA","~18 months; employers with ≥ 20 employees; you pay full premium + 2%"],
          ["Medicare A / B","A = hospital (premium-free at 40 quarters) · B = outpatient (premium, IRMAA)"],
          ["Medicare C / D","C = Advantage · D = prescription drugs"],
          ["Part D 2025 (IRA)","Donut hole removed · $2,000 annual out-of-pocket cap"],
          ["Medicaid","Means-tested; main payer of long-term care after spend-down"]
        ],
        mustKnow: [
          "<b>HSA</b> needs an HDHP and is the only <b>triple-tax-advantaged</b> account.",
          "<b>COBRA</b> continues group coverage ~18 months at full cost + 2%.",
          "Medicare: <b>A</b> hospital · <b>B</b> outpatient · <b>C</b> Advantage · <b>D</b> drugs.",
          "<b>Medicaid</b> (not Medicare) pays for <b>long-term custodial care</b> after spend-down."
        ],
        traps: [
          "Saying <b>Medicare</b> covers long-term custodial care — that's <b>Medicaid</b>.",
          "Funding an HSA without an <b>HDHP</b>.",
          "Confusing Medicare <b>Part C</b> (Advantage) with <b>Part D</b> (drugs)."
        ],
        tips: [
          "Long-term custodial care + low assets → <b>Medicaid</b>.",
          "'Triple tax advantage' → <b>HSA</b>."
        ]
      },
      6: {
        keyNumbers: [
          ["DI definitions","Own-occ (broadest) → modified own-occ → any-occ → Social Security (narrowest)"],
          ["Elimination period","Waiting period before benefits begin (e.g., 90 days)"],
          ["Benefit period","How long benefits last (e.g., to age 65)"],
          ["DI taxation","Employer-paid premium → benefits TAXABLE · employee after-tax → TAX-FREE"],
          ["LTC trigger","2 of 6 ADLs or cognitive impairment"]
        ],
        mustKnow: [
          "Rank DI definitions: <b>own-occ</b> is broadest/most expensive; <b>any-occ</b> narrowest.",
          "DI benefit taxation depends on <b>who paid the premium</b> (with what dollars).",
          "<b>LTC</b> triggers: unable to perform <b>2 of 6 ADLs</b> or cognitive impairment."
        ],
        traps: [
          "Reversing DI taxation — <b>employer-paid = taxable</b>; employee after-tax = tax-free.",
          "Confusing the <b>elimination period</b> (start delay) with the <b>benefit period</b> (duration).",
          "Mixing up <b>own-occ</b> vs <b>any-occ</b> definitions."
        ],
        tips: [
          "'Who paid the premium?' decides DI benefit taxation.",
          "Broadest / most-expensive disability definition = <b>own-occ</b>."
        ]
      },
      7: {
        keyNumbers: [
          ["Group term life","First $50,000 tax-free; excess → Section 79 imputed income (Table I)"],
          ["Section 125","Cafeteria plan: choose pre-tax benefits"],
          ["FSA","Use-it-or-lose-it (limited carryover/grace); not portable"],
          ["Nondiscrimination","Favoring HCEs can void the tax break for them"]
        ],
        mustKnow: [
          "First <b>$50,000</b> of employer group term life is tax-free; the excess is <b>imputed income</b> (Table I).",
          "<b>Cafeteria (Section 125)</b> plans let employees choose pre-tax benefits.",
          "<b>FSAs</b> are use-it-or-lose-it with limited carryover/grace.",
          "<b>Nondiscrimination</b> rules protect rank-and-file; violations cost HCEs the tax break."
        ],
        traps: [
          "Imputing income on the <b>first $50k</b> — only coverage <b>over $50k</b> is taxable.",
          "Treating an FSA like an HSA (FSAs aren't investable or portable)."
        ],
        tips: [
          "Group term life > $50k → compute <b>Section 79</b> imputed income on the excess only."
        ]
      },
      8: {
        keyNumbers: [
          ["Cross-purchase","Owners buy each other's interest; buyers get a BASIS STEP-UP; n(n−1) policies"],
          ["Entity-purchase","Business buys the interest; fewer policies (n); NO basis step-up"],
          ["Key person","Business owns/pays/benefits; premiums NOT deductible, proceeds generally tax-free"],
          ["Split-dollar","Employer & employee share premium and benefit"]
        ],
        mustKnow: [
          "<b>Cross-purchase</b>: surviving owners get a <b>basis step-up</b>; needs many policies.",
          "<b>Entity (stock-redemption)</b>: company buys; fewer policies but <b>no</b> basis step-up.",
          "<b>Key-person</b>: business is owner & beneficiary; premiums <b>not deductible</b>."
        ],
        traps: [
          "Saying entity-purchase gives survivors a <b>basis step-up</b> — only <b>cross-purchase</b> does.",
          "Deducting <b>key-person</b> or buy-sell premiums (they're <b>not</b> deductible)."
        ],
        tips: [
          "Few owners + want basis step-up → <b>cross-purchase</b>; many owners → <b>entity</b>."
        ]
      }
    }
  };
  /* FP513-GEN-START (scripts/build_fp513.mjs — do not hand-edit) */
  window.READER_MAP.FP513 = 'apps/fp513-reading.html';
  window.TAB_MAP.FP513 = {"1":"markets","2":"debt","3":"equity","4":"valuation","5":"alternatives","6":"risk","7":"returns","8":"portfolio","9":"case"};
  window.MODOBJ.FP513 = {"1":["LO 1.1.1: Identify what financial intermediaries do, especially investment bankers and dealers","LO 1.2.1: Identify the parts, terms and mechanics of primary and secondary markets (orders, short sales, margin)","LO 1.3.1: Recognize the features and tax treatment of each type of cash or cash equivalent","LO 1.4.1: Assess how capital gains and losses, dividends and wash sales affect an investor's taxes"],"2":["LO 2.1.1: Know bond terms, issuer types (Treasury, agency, muni, corporate, foreign), their tax treatment and the risks bonds carry","LO 2.2.1: Calculate a convertible's conversion ratio and value, investment value, both premiums and downside risk","LO 2.3.1: Analyze immunization, ladders, barbells, bullets and the five bond swaps","LO 2.3.2: Match fixed-income choices to an investor's goals, taxes, horizon and rate outlook","LO 2.4.1: Read yield curve shapes, the three term-structure theories and what each curve implies for buying bonds","LO 2.5.1: Recognize preferred stock features, how it compares with bonds and how to value it"],"3":["LO 3.1.1: Describe common stock, its main types (blue-chip, growth, income, value, cyclical, defensive, technology), its risks, and rights vs. warrants","LO 3.2.1: Explain how cash dividends, DRIPs, stock dividends, splits and reverse splits affect shareholders, basis and the company","LO 3.3.1: Compare open-end funds (NAV, share classes, expenses, fund objectives, taxation), closed-end funds, UITs and separately managed accounts","LO 3.4.1: Describe ETFs, hedge funds, funds of funds and GICs and who each suits","LO 3.5.1: Calculate average cost per share under dollar cost averaging, value averaging and share averaging, and fund basis under each basis method","LO 3.6.1: Use objectives, holdings, manager flexibility, performance, fees, turnover, size, age and tax efficiency to select funds"],"4":["LO 4.1.1: Explain why bond prices move opposite to interest rates and price a bond from its cash flows","LO 4.1.2: Use duration and convexity to estimate how much a bond's price will change when rates move","LO 4.2.1: Compare fundamental and technical analysis and connect each to MPT and the EMH","LO 4.2.2: Judge how debt financing changes ROE, risk, dividend growth and stock value","LO 4.3.1: Value a stock with the no-growth, constant growth and multistage DDMs, FCFE and capitalized earnings","LO 4.3.2: Use P/E, PEG, P/FCF and P/S to decide whether a stock looks cheap or expensive"],"5":["LO 5.1.1: Compare ways to own investment real estate, value it with NOI and cap rates, and know how it is taxed","LO 5.2.1: Recognize option types and positions, payoffs, intrinsic/time value, pricing-model inputs and option taxation","LO 5.2.2: Choose option strategies for speculation, income and hedging (covered calls, protective puts, collars, straddles)","LO 5.3.1: Explain futures terms, margin and marking to market, short vs. long hedges, and 60/40 taxation","LO 5.4.1: Weigh collectibles, gold and natural resources, including liquidity and the 28% collectibles rate","LO 5.5.1: Assess the risks and benefits of foreign securities, market types, fund choices and ADRs","LO 5.5.2: Measure how exchange rate moves change a foreign investment's return in dollars"],"6":["LO 6.1.1: Recognize risk-and-return terms used in building and managing portfolios (diversification, asset allocation, expected return)","LO 6.1.2: Separate systematic (PRIME) from unsystematic risks and identify each source","LO 6.2.1: Calculate beta and weighted portfolio beta and explain how they guide portfolio construction","LO 6.2.2: Calculate mean and standard deviation for one asset and the 1-, 2- and 3-SD return ranges","LO 6.2.3: Calculate the coefficient of variation and use it to compare risk per unit of return","LO 6.2.4: Use covariance and correlation to compute a two-asset portfolio's standard deviation","LO 6.2.5: Calculate R-squared and use it to judge whether beta is a reliable risk measure"],"7":["LO 7.1.1: Calculate return measures &mdash; simple, compound, arithmetic/geometric mean, time- vs dollar-weighted, real and after-tax, APR/EAR, HPR, total return","LO 7.2.1: Evaluate risk-adjusted performance with Jensen's alpha, Treynor, Sharpe and the information ratio","LO 7.3.1: Match portfolios to the right index or blended benchmark and know how indices are weighted","LO 7.4.1: Compute current yield, YTM, YTC and taxable equivalent yield"],"8":["LO 8.1.1: Evaluate MPT assumptions, indifference curves, and the efficient frontier","LO 8.2.1: Analyze capital market theory, the CML, CAPM, and the SML","LO 8.3.1: Identify the weak, semistrong, and strong forms of the EMH","LO 8.3.2: Appraise how the EMH relates to technical, fundamental, active/passive, and foreign investing","LO 8.4.1: Identify the components of an investment policy statement","LO 8.5.1: Judge which investments look attractive across interest-rate and economic cycles","LO 8.5.2: Critique strategic, tactical, core-and-satellite, and other allocation methods","LO 8.6.1: Evaluate how clients and planners manage crisis events with severe financial consequences"],"9":["Case approach: use case facts analysis or question review to work a multi-question case efficiently","LO 8.4.1: Build the IPS: liquidity needs, return requirement, ability vs. willingness to take risk","LO 8.6.1 / LO 1.3.1: Size and house the emergency reserve; respond to crises and discontinuous change","LO 8.5.2 / LO 5.2.2: Choose an allocation approach and manage a concentrated stock (exchange fund, puts, collar)","LO 8.2.1 / LO 6.2.1 / LO 6.2.5 / LO 7.2.1: Required return, portfolio beta, diversifier choice and fund selection","LO 1.4.1 / LO 7.4.1 / LO 3.6.1 / LO 7.1.1: Wash sales, taxable-equivalent yield, asset placement, after-tax real return","LO 4.1.2 / LO 2.3.1 / LO 5.5.2: Duration risk, immunizing a near-term goal, and currency effects on returns"]};
  window.MODSYN.FP513 = {"1":"This module is the plumbing of investment planning: how securities are born (underwriting), where they trade (primary vs. secondary markets), how trades are executed and financed (orders, margin, short sales), and what the client keeps after tax. Cash equivalents anchor the emergency fund and supply the risk-free rate used in later return and portfolio models. The tax rules here (netting, wash sales, qualified dividends, NIIT) drive asset location and tax-loss harvesting decisions in every client review.","2":"Bonds are the stability and income engine of most client portfolios, so this module feeds asset allocation (Module 6), bond pricing, duration and yield math (Modules 4 and 7) and tax-aware account placement. Knowing which issuer, structure and maturity fits a client's bracket, horizon and rate outlook is the core of a fixed-income recommendation, and convertibles and preferreds bridge into equity analysis.","3":"This module turns the risk and return tools from earlier modules into product choices: which stock type, which pooled vehicle, and which share class fits a client. Distribution and basis rules link directly to tax planning (qualified dividends, capital gain distributions, basis methods), while averaging techniques and fund-selection screens feed portfolio construction and asset allocation. In client work the same screens (expense ratio, turnover, tax efficiency and a fund's real, not labeled, allocation) decide which funds earn a place in a plan.","4":"Module 4 turns the risk ideas from earlier modules into prices. Duration quantifies the interest-rate risk in every bond allocation and drives horizon matching in client plans, while the DDMs plug a CAPM required return and a growth rate from financial-statement analysis into an intrinsic value. Relative ratios and financial-statement analysis are the everyday tools for deciding whether a recommendation is worth its price.","5":"Module 5 adds the tools that sit beside stocks and bonds: real assets and foreign securities widen diversification because they move differently from U.S. financial assets, while options and futures let a client transfer or shape risk. In planning, these show up as REIT income sleeves, collars on concentrated stock, index puts or futures as portfolio insurance, and international funds whose currency exposure must be explained. Each carries its own liquidity, leverage and tax rules that feed directly into asset allocation and tax planning.","6":"This module supplies the risk math the rest of investment planning runs on. Standard deviation and beta feed the Sharpe, Treynor and Jensen performance measures and CAPM-style required returns; correlation and covariance drive asset allocation and modern portfolio theory; and R-squared tells you which of those risk measures you can trust. In client work, these numbers turn \"how risky is this?\" into ranges, comparisons and diversification choices a client can see.","7":"Module 6 measured risk (standard deviation, beta, R&sup2;); this module turns those into return and risk-adjusted performance numbers, so the R&sup2; &ge; 0.70 test decides whether beta-based measures can be trusted. The same IRR and TVM mechanics drive dollar-weighted returns and bond yields, and TEY links bond selection to the client's tax bracket. In client reviews these measures, paired with the right benchmark, are how a planner shows whether a manager or portfolio actually earned its keep.","8":"Module 8 turns the risk and return tools from earlier modules into a portfolio process: MPT and CAPM say how much return a given risk deserves, the EMH says whether paying for active management is worth it, and the IPS writes those choices down as a client's policy. Asset allocation then implements that policy across economic cycles, and the crisis section tests whether the client can stick with it when markets break.","9":"Module 9 pulls Modules 1&ndash;8 into one client file. The Calloway case shows that each tool answers a different question: the IPS sets the rules, CAPM and beta judge risk and price, Sharpe and R&sup2; pick funds, TEY and placement cut taxes, duration and immunization protect dated goals, and the reserve keeps a crisis from forcing bad sales. On the exam, find the client facts that each question depends on, then apply the single right formula or rule."};
  window.MODEX.FP513 = {"1":{"title":"Harvesting a loss without tripping the wash sale rule","html":"<p>Fictional client Mara has a $12,000 net long-term gain this year from selling a fund. She also holds 300 shares of Pine Co. with a $21,000 basis now worth $15,600.</p><ol><li>Sell Pine: $15,600 &minus; $21,000 = &minus;$5,400 short-term loss (held under a year).</li><li>Cross-net: $12,000 LT gain &minus; $5,400 = $6,600 net LT gain taxed at 0/15/20% (2026 edition figure) instead of $12,000.</li><li>If she rebuys Pine within 30 days before or after the sale (2026 edition figure), the loss is disallowed and her new basis becomes the repurchase cost + $5,400.</li><li>Option: wait 31+ days, or hold something similar but not the same meanwhile.</li></ol>"},"2":{"title":"Convertible bond: five numbers from one set of facts","html":"<p>$1,000 par, 4% semiannual coupon, 10 years left, straight bonds yield 6%, conversion price $62.50, stock $55, convertible priced at $1,000.</p><ul><li>Conversion ratio = $1,000 &divide; $62.50 = 16 shares</li><li>Conversion value = 16 &times; $55 = $880</li><li>Investment value: N 20, I/YR 3, PMT $20, FV $1,000 &rarr; $851.23</li><li>Floor = greater of $851.23 and $880 = $880</li><li>Conversion premium = $120 &divide; $880 = 13.64%</li><li>Investment premium = $148.77 &divide; $851.23 = 17.48%</li><li>Downside risk = $148.77 &divide; $1,000 = 14.88%</li></ul>"},"3":{"title":"Dollar cost averaging: average cost vs. average price","html":"<p>Jun invests $3,000 a month for four months at prices of $20, $15, $24 and $16.</p><table><thead><tr><th>Month</th><th>Price</th><th>Shares</th></tr></thead><tbody><tr><td>1</td><td>$20</td><td>150.0</td></tr><tr><td>2</td><td>$15</td><td>200.0</td></tr><tr><td>3</td><td>$24</td><td>125.0</td></tr><tr><td>4</td><td>$16</td><td>187.5</td></tr><tr><td><b>Total</b></td><td></td><td><b>662.5</b></td></tr></tbody></table><p>Average cost = $12,000 &divide; 662.5 = <b>$18.11</b>. Average price = ($20 + $15 + $24 + $16) &divide; 4 = <b>$18.75</b>. The fixed dollar amount bought more shares when the price was low, so cost is $0.64 below the average price. At the final $16 price the account is worth $10,600 &mdash; a $1,400 loss, so DCA lowers cost but does not guarantee a profit.</p>"},"4":{"title":"Is Kestrel worth $54 to Selma?","html":"<p>Kestrel just paid a $2.40 dividend, expected to grow 4% a year. Selma requires 9%.</p><ol><li>D<sub>1</sub> = 2.40 &times; 1.04 = $2.496</li><li>V = 2.496 &divide; (0.09 &minus; 0.04) = <b>$49.92</b></li><li>Price $54 &gt; value $49.92 &rarr; <b>overvalued</b> for Selma; don't buy at $54.</li></ol><p>Sensitivity: if her required return fell to 8%, V = 2.496 &divide; 0.04 = $62.40 &mdash; small changes in r &minus; g swing the answer a lot.</p>"},"5":{"title":"Collar on a concentrated position","html":"<p>Rina owns 1,000 shares bought at $20, now $60. She buys 10 puts with a $55 strike at $2.40 and writes 10 calls with a $70 strike at $2.40.</p><ul><li>Net premium: $2,400 received &minus; $2,400 paid = <b>$0</b> (zero-cost collar)</li><li>Floor: if the stock falls to $40, she can sell at $55 &rarr; value protected at $55,000</li><li>Ceiling: above $70 the shares are called away at $70 &rarr; value capped at $70,000</li><li>Range kept until expiration: $55,000 to $70,000, versus $60,000 today</li></ul>"},"6":{"title":"Is the new fund a real diversifier?","html":"<p>Rosa holds an S&amp;P 500 index fund. A candidate fund has &sigma; = 20, the market &sigma; = 16, and their covariance is 224.</p><ol><li>&rho; = 224 &divide; (20 &times; 16) = 0.70</li><li>R<sup>2</sup> = 0.70<sup>2</sup> = 0.49 &rarr; under 0.70, so it is not just an index look-alike, and beta (224 &divide; 256 = 0.875) is not reliable</li><li>Judge it with standard deviation and Sharpe, and check portfolio SD: at 50/50 with this correlation, &radic;[0.25(400) + 0.25(256) + 2(0.25)(224)] = &radic;276 &asymp; 16.61, below the 18.00 weighted-average SD.</li></ol>"},"7":{"title":"Did the manager add value?","html":"<p>Portfolio: 11% return, beta 1.2, &sigma; 16%, R&sup2; 0.85. Market 9%, risk-free 3%.</p><ul><li>CAPM required = 3 + 1.2(9 &minus; 3) = 10.2% &rarr; <b>alpha +0.80%</b></li><li>Treynor = (11 &minus; 3) &divide; 1.2 = <b>6.67</b></li><li>Sharpe = (11 &minus; 3) &divide; 16 = <b>0.50</b></li></ul><p>R&sup2; &ge; 0.70, so all three are usable; positive alpha means the manager beat the return required for the risk taken.</p>"},"8":{"title":"Should Nora buy this fund? (CAPM decision)","html":"<p>Nora requires 8% from a new equity fund. The fund's beta is 1.1, T-bills yield 3.5%, and the market is expected to return 8.5%.</p><ol><li>Market risk premium = 8.5% &minus; 3.5% = 5.0%</li><li>Stock risk premium = 5.0% &times; 1.1 = 5.5%</li><li>CAPM expected return = 3.5% + 5.5% = 9.0%</li><li>9.0% &ge; 8% required &rarr; acceptable on a risk-adjusted basis</li></ol><p>Check: a beta-0.8 fund would give 3.5% + 5.0% &times; 0.8 = 7.5%, below her 8% requirement &rarr; pass.</p>"},"9":{"title":"Calloway case: three linked numbers","html":"<p><b>Reserve:</b> 6 &times; $13,500 = $81,000 target &minus; $62,000 liquid = <b>$19,000 gap</b>.</p><p><b>KDX required return:</b> 4.0% + (10.0% &minus; 4.0%) &times; 1.40 = <b>12.4%</b> &gt; 11.0% expected, so do not add to KDX.</p><p><b>Muni vs. corporate:</b> 3.6% &divide; (0.95 &times; 0.68) = <b>5.57%</b> TEY &gt; 5.2% corporate, so choose the municipal fund for the taxable account.</p>"}};
  window.MODCHEAT.FP513 = {"1":{"keyNumbers":[["Reg T initial margin","50% (2026 edition figure)"],["Maintenance margin","Broker-set, usually 35%; NYSE Rule 431(b) floor 25%"],["SIPC","$500,000 per customer, max $250,000 cash (2026 edition figure)"],["FDIC (CDs, MMDAs)","$250,000 per ownership category (2026 edition figure)"],["Commercial paper","Max 270 days; usually $100,000+"],["Capital loss deduction","$3,000/yr net; excess carried forward indefinitely (2026 edition figure)"],["Qualified dividend holding","More than 60 days in 121-day window (2026 edition figure)"],["NIIT","3.8% &times; lesser of NII or MAGI over $250K MFJ / $125K MFS / $200K other (2026 edition figure)"]],"mustKnow":["Firm commitment: underwriter bears unsold shares; best efforts: issuer does","Stop &rarr; market order (execution certain); stop-limit &rarr; limit order (price certain)","Margin-call price = loan per share &divide; (1 &minus; maintenance %)","Liquid &ne; marketable: MMDA is liquid only; T-bill is both","T-bill income: federal ordinary income, state-exempt; munis: federal-exempt, state-taxable unless in-state","Netting: ST with ST, LT with LT, then cross-net; $3,000 cap on net loss","Wash sale: disallowed loss is added to the replacement shares' basis"],"traps":["Using the original purchase price (not current price) when computing a margin deposit","Forgetting the short seller pays dividends to the share lender","Calling a money market mutual fund FDIC-insured (only MMDAs are)","Treating REIT or S corporation dividends as qualified","Thinking the wash-sale window only looks forward from the sale"],"tips":["Margin HPR: divide by the investor's own money and subtract margin interest","NIIT: always compare NII to MAGI over the threshold and tax the smaller","For I/II/III/IV items, eliminate any combination containing one false statement first"]},"2":{"keyNumbers":[["Investment-grade line","BBB&minus; (S&amp;P) / Baa (Moody's) and above"],["Exam defaults","$1,000 par; semiannual coupons"],["Basis point","1/100 of 1%"],["Corporate call protection","Generally at least 10 years"],["Dividends-received deduction","50% if &lt;20% owned; 65% if 20%+ (2026 edition figure)"],["Private activity bond tests","&gt;10% private use; qualified if 95%+ for qualified purposes (2026 edition figure)"],["EE / I bonds","$25&ndash;$10,000; 12-month hold; 3-month penalty within 5 years (2026 edition figure)"],["GNMA certificate minimum","$25,000 (2026 edition figure)"]],"mustKnow":["TEY = tax-exempt yield &divide; (1 &minus; t); after-tax yield = taxable yield &times; (1 &minus; t)","Convertible: ratio = par &divide; conversion price; CV = ratio &times; stock price; floor = greater of IV or CV","Downside risk % divides by market price; investment premium % divides by investment value","Immunization: portfolio duration = time horizon; rebalance as duration drifts","Only liquidity preference theory is limited to an upward-sloping curve","Treasuries: no state/local tax; agencies: taxable at all levels; GNMA has the direct guarantee","Preferred: V = D &divide; r; dividend is % of par, paid quarterly; cumulative arrears come first"],"traps":["Treasuries are default-risk free, not risk free","Zeros and STRIPS create phantom income in taxable accounts","Eurobonds can be in any currency; Yankee bonds remove currency risk","With an inverted curve, the textbook favors call-protected long bonds","A barbell is active; a ladder is the passive, staggered one"],"tips":["Convertible questions: write CV, IV and price in a row before computing any %","With state tax in a muni problem, tax each bond only where it is actually taxed","Low coupon + long maturity + low YTM = biggest price swings"]},"3":{"keyNumbers":[["Qualified dividend holding test","More than 60 days in the 121-day window starting 60 days before ex-date (2026 edition figure)"],["Qualified dividend rates","0% / 15% / 20% (2026 edition figure)"],["Market-cap bands","Small up to $2B; mid $2B&ndash;$10B; large over $10B"],["Expense ratio range","Under 0.20% (some index funds) to 2.00%+"],["Hedge fund of funds","Usually holds about 10&ndash;30 hedge funds"],["Separately managed account","Minimums often $50,000+"],["Loss recovery","&minus;50% needs +100%; &minus;40% needs +66.67%"],["Class B CDSC","May be waived after about 5 years"]],"mustKnow":["Buy before the ex-dividend date to get a declared dividend","Stock dividends and splits: no tax, same total value and basis, lower basis per share","NAV per share = (assets &minus; liabilities) &divide; shares; forward pricing at the next NAV","Closed-end funds trade at a premium or discount to NAV; open-end funds trade at NAV (+ load)","DCA average cost = total dollars &divide; total shares, which is below the simple average price","Basis = price + commissions + reinvested distributions; specific ID most favorable, FIFO the default","Expense ratio excludes loads and trading costs; turnover = lesser of buys or sells &divide; average assets"],"traps":["Reinvested dividends and capital gain distributions are still taxable (constructive receipt)","Value averaging can require selling; DCA and share averaging never do","GICs are insurer-backed, not FDIC-insured","'No-load' funds may still charge 12b-1 fees (hidden loads)","A fund labeled 'stock' may hold cash or foreign stocks: check manager flexibility"],"tips":["For split questions, total value never changes; only the share count and price per share do","On basis-method questions in a rising market: specific ID gives the lowest gain, FIFO the highest","Match the fund to the client's top-priority objective first, then risk tolerance, then cost and taxes"]},"4":{"keyNumbers":[["Duration price change","&Delta;P/P = &minus;D &times; [&Delta;y &divide; (1 + y)]; y = current YTM (semiannual: y &divide; 2)"],["Rule of thumb","%&Delta;P &asymp; &minus;D &times; &Delta;y (duration 6, +1% &rarr; about &minus;6%)"],["Bond price inputs","N = years &times; 2, PMT = coupon &divide; 2, I/YR = market yield, FV = par"],["Sustainable growth","g = ROE &times; (1 &minus; payout)"],["Gordon model","V = D<sub>0</sub>(1 + g) &divide; (r &minus; g); g must be &lt; r"],["No-growth / preferred","V = D &divide; r"],["PEG","P/E &divide; g (whole number); under 1.00 = value"],["P/FCF","(1 + g) &divide; (r &minus; g)"]],"mustKnow":["Duration falls as coupon or market yield rises and grows with maturity; a zero's duration equals its maturity","Match a bond's duration, not its maturity, to the client's time horizon","Positive convexity: duration understates gains and overstates losses; callable and mortgage-backed bonds show negative convexity","Premium bond: CY > YTM > YTC; discount bond: CY < YTM < YTC","Leverage raises ROE and EPS but adds fixed interest that hurts in a contraction; low ROA vs. ROE signals leverage","Constant growth fits mature firms; multistage fits growth-phase firms; FCFE fits non-dividend payers","Intrinsic value above price = undervalued; relative methods need a peer or industry benchmark"],"traps":["Using the coupon rate as y in the duration formula","Plugging D<sub>0</sub> into the Gordon model without growing it to D<sub>1</sub>","Multiplying ROE by the payout ratio instead of the retention rate","Treating technical analysis as useful under any form of the EMH","Picking the lowest P/E without adjusting for growth (use PEG)"],"tips":["Predict premium or discount before pricing a bond; it catches calculator entry errors","If a YTM is given in a duration question, use the (1 + y) version of the formula","In multistage problems, add the terminal value to the last high-growth year's cash flow before taking the NPV"]},"5":{"keyNumbers":[["Value = NOI &divide; cap rate","NOI excludes depreciation and debt service"],["REIT tests: 90% / 75%","Distribute &ge;90% of net earnings; &ge;75% of gross income from real estate (2026 edition figures)"],["1 option = 100 shares","Multiply per-share premiums and payoffs by 100"],["Call BE = strike + premium; put BE = strike &minus; premium","Applies to buyer and writer alike"],["Futures initial margin ~5&ndash;10%","Margin call restores the initial level"],["Futures tax 60% LT / 40% ST","Regardless of holding period (2026 edition figure)"],["Collectibles max LTCG 28%","Higher than securities (2026 edition figure)"],["Gold allocation 5&ndash;10%","Possible advisor cap in a diversified portfolio"]],"mustKnow":["Max gain/loss for all four option positions: only the long call (gain) and naked short call (loss) are unlimited","Intrinsic value: call = stock &minus; strike, put = strike &minus; stock, never below zero; time value = premium &minus; intrinsic","Black-Scholes: every input raises call value except the exercise price","Short hedge = own the asset, sell futures; long hedge = need the asset, buy futures","REIT income is portfolio income; RELPs fall under passive activity rules","A U.S. owner of foreign securities wants the dollar to fall during the holding period; ADRs keep currency risk"],"traps":["Subtracting mortgage interest or depreciation when computing NOI","Calling a long put's gain unlimited (it is strike &minus; premium)","Restoring a futures account only to maintenance margin","Hedging a short sale with puts instead of calls","Choosing a global fund to diversify away from U.S. holdings"],"tips":["Write the four-position payoff table from memory before any option question","For currency questions, first restate the quote as foreign units per $1, then divide to get dollars","Hedges always take the position opposite the cash exposure"]},"6":{"keyNumbers":[["68 / 95 / 99%","Share of returns within &plusmn;1, 2, 3 SD (textbook uses 99%, not 99.7%)"],["R&sup2; &ge; 0.70","Beta reliable; Treynor/Jensen OK (Morningstar). &rho; &asymp; &plusmn;0.84"],["10&ndash;15","Large-cap stocks in different industries to diversify (exam rule)"],["25&ndash;30 / 4&ndash;7","Small/mid-cap stocks / mutual funds in different asset classes"],["n &minus; 1","Sample SD divisor for historical returns (calculator S<sub>x</sub>)"],["&beta; = 1.0","Market; &lt;1 defensive, &gt;1 aggressive, 0 = no correlation (T-bills)"],["&rho; = +1","Only case where portfolio SD = weighted-average SD"]],"mustKnow":["Total risk (SD) = systematic (beta) + unsystematic; PRIME = purchasing power, reinvestment rate, interest rate, market, exchange rate","&beta; = COV<sub>im</sub> &divide; &sigma;<sub>m</sub><sup>2</sup> = &rho;<sub>im</sub>&sigma;<sub>i</sub> &divide; &sigma;<sub>m</sub>; portfolio beta = dollar-weighted average","CV = &sigma; &divide; mean; lower is better","COV = &rho;&sigma;<sub>i</sub>&sigma;<sub>j</sub>; &rho; = COV &divide; (&sigma;<sub>i</sub>&sigma;<sub>j</sub>); R<sup>2</sup> = &rho;<sup>2</sup>; 1 &minus; R<sup>2</sup> = unsystematic share","&sigma;<sub>p</sub> = &radic;[W<sub>i</sub><sup>2</sup>&sigma;<sub>i</sub><sup>2</sup> + W<sub>j</sub><sup>2</sup>&sigma;<sub>j</sub><sup>2</sup> + 2W<sub>i</sub>W<sub>j</sub>COV<sub>ij</sub>]","Normal distribution for annual returns; lognormal for ending portfolio value"],"traps":["Low beta &ne; low volatility &mdash; low correlation shrinks beta (gold funds)","Liquidity and marketability risk are unsystematic; common stock has no default risk","Don't weight-average SDs unless &rho; = +1; don't stop at the variance","Only one tail: 95% within &plusmn;2 SD leaves 2.5% above and 2.5% below","CV questions pad the facts &mdash; ignore beta and R<sup>2</sup>"],"tips":["Check R<sup>2</sup> first: it tells you whether to trust beta (Treynor/Jensen) or use SD (Sharpe)","Correlation pyramid: covariance (unbounded) &rarr; correlation (&minus;1 to +1) &rarr; R<sup>2</sup> (square it)","Zero-coupon bonds eliminate reinvestment rate risk; Yankee bonds reduce exchange rate risk"]},"7":{"keyNumbers":[["R&sup2; &ge; 0.70","Beta is reliable &rarr; Treynor and Jensen usable; below it, use Sharpe"],["IR &ge; 0.50","Often a top-quartile active manager"],["2 P/Yr, END","Bond default: PMT = coupon &times; $1,000 &divide; 2, N = years &times; 2, zeros included"],["$1,000","Default face value (FV, positive); price is a negative PV"],["30 days","SEC yield measurement window, net of expenses (2026 edition figure)"],["&times; 4","Textbook annualizes a quarterly IRR by multiplying, not compounding"],["&gt; 0.95","DJIA's correlation with the S&amp;P 500"]],"mustKnow":["Real return = (1 + nominal) &divide; (1 + inflation) &minus; 1 &mdash; not subtraction","Geometric mean &lt; arithmetic mean unless all returns are equal","Time-weighted = the investment/manager; dollar-weighted = the investor's IRR","Alpha = actual &minus; CAPM required; Treynor &divide; beta; Sharpe &divide; standard deviation","YTC: FV = call price, N = periods to first call","TEY = muni yield &divide; (1 &minus; t); in-state itemizer: &divide; (1 &minus; SMTB)(1 &minus; FMTB)"],"traps":["Using Treynor/Jensen when R&sup2; is below 0.70","Forgetting to double the semiannual rate (or using N = years)","Multiplying a muni yield by (1 &minus; t) instead of dividing","Benchmarking a multi-asset portfolio against the S&amp;P 500 alone","Treating a multi-year HPR as an annual return"],"tips":["Discount bond: coupon &lt; CY &lt; YTM &lt; YTC; premium bond: the reverse","In Sharpe/Treynor/IR you can use whole numbers or decimals &mdash; just be consistent","Compare Sharpe ratios only within one asset class"]},"8":{"keyNumbers":[["CAPM","r = r<sub>f</sub> + (r<sub>m</sub> &minus; r<sub>f</sub>)&beta;"],["CML","r<sub>p</sub> = r<sub>f</sub> + &sigma;<sub>p</sub>(r<sub>m</sub> &minus; r<sub>f</sub>) &divide; &sigma;<sub>m</sub>"],["APT","r = a<sub>0</sub> + b<sub>1</sub>F<sub>1</sub> + &hellip; + b<sub>n</sub>F<sub>n</sub> + e (4 primary factors)"],["Diversification","10&ndash;15 large caps (some studies 20&ndash;40); ~2&times; as many small/mid caps; 4&ndash;7 asset classes"],["Brinson et al.","&gt;90% of return variability from asset allocation"],["Liquidity rule of thumb","Money needed within ~5 years stays out of stocks"],["Growth stocks","Earnings growth ~15%+/yr, low payout, high P/E, higher beta"]],"mustKnow":["Optimal portfolio = tangency of the highest indifference curve with the efficient frontier; steeper curve = more risk averse","CML uses standard deviation (efficient portfolios); SML uses beta (any security); above SML = undervalued","Weak form: fundamental + inside info can win; semistrong: inside info only; strong: nothing; technical analysis never","IPS: return and risk objectives plus liquidity, time horizon, legal, tax, unique circumstances, permitted/excluded investments","Strategic = long-term mix + rebalancing; TAA = contrarian market timing; core-and-satellite = strategic core + tactical satellite","Crisis: ignore noise, watch incremental change, rewrite the IPS for discontinuous change; usually take no action when a client wants cash"],"traps":["Stock risk premium is (r<sub>m</sub> &minus; r<sub>f</sub>)&beta;, not r<sub>m</sub>&beta; and not the full required return","Inflation shifts the SML in parallel; changing risk aversion changes its slope","There is no semiweak form of the EMH","Exchange fund (diversify, keep value, defer gains) is not an exchange-traded fund"],"tips":["For any CAPM decision, compute the required return first, then compare it with the forecast or the client's hurdle","Tie EMH questions to the information set: past prices &rarr; public &rarr; private"]},"9":{"keyNumbers":[["Emergency reserve gap","6 &times; $13,500 &minus; $62,000 = $19,000"],["KDX CAPM required return","4% + 6% &times; 1.40 = 12.4% (expected 11.0%)"],["Equity sleeve weighted beta","$635,104 &divide; $482,060 = 1.32"],["R&sup2; diversifier cutoff","0.70 (R &asymp; 0.84)"],["Muni TEY, itemizer","3.6% &divide; (0.95 &times; 0.68) = 5.57%"],["Bond fund if rates +1%","&minus;6.2 &times; 0.01 &divide; 1.052 = &minus;5.89% &rarr; $56,464"],["Protective put floor","$320,000 &minus; $10,000 premium = $310,000"],["Euro fund in dollars","1.09 &times; (1.02 &divide; 1.08) &minus; 1 = 2.94%"]],"mustKnow":["Money needed within about 3&ndash;5 years is a liquidity constraint and generally stays out of stocks.","Ability to take risk (resources) and willingness (emotions) are different; the risk objective must fit the return requirement.","Low R&sup2; (&lt; 0.70) makes beta unreliable: use Sharpe, not Treynor or Jensen.","Duration matched to the goal date immunizes; a zero-coupon bond&rsquo;s duration equals its maturity.","Tax-inefficient holdings belong in tax-deferred accounts; munis never belong in an IRA or Roth.","Exchange fund = diversify a concentrated position without immediate gains tax while keeping the value."],"traps":["Leaving the risk-free rate out of CAPM (8.4% or 14.0% instead of 12.4%).","Applying state tax to T-bill interest, or adding brackets for an itemizer&rsquo;s TEY.","Using the duration rule of thumb when the question asks for the formula with 1 + YTM.","Forgetting that a wash-sale loss is added to the new shares&rsquo; basis.","Calling a market drop a discontinuous change when the client&rsquo;s own situation is unchanged."],"tips":["Read the last line of each question first; it tells you which facts to hunt for.","Answer the rule-based questions first and save multi-step calculations for later.","Write the client&rsquo;s brackets, risk-free rate and market return in your scratch notes once and reuse them."]}};
  window.FP513_CASE = {"m":"FP513","d":"D","title":"The Calloway Family: Integrated Investment Planning Case","stem":"<p><b>The Calloway family</b> asks a CFP&reg; professional to coordinate their investment plan.</p><p><b>Graham Calloway</b>, 53, operations director at a privately held freight-logistics company (salary $165,000). <b>Nadia Calloway</b>, 50, senior software engineer at Kestrel Diagnostics, Inc., a publicly traded medical-testing company (salary $185,000). Married filing jointly; they itemize deductions. Children: <b>Leah</b>, 15 (starts college in three years) and <b>Sam</b>, 11. Both are in good health and carry adequate life, disability and umbrella coverage. Assume today is January 1 of the current year.</p><p><b>Statement of financial position &mdash; assets</b></p><table><thead><tr><th>Group</th><th>Asset</th><th>Value</th></tr></thead><tbody><tr><td>Cash &amp; equivalents</td><td>Checking account</td><td>$18,000</td></tr><tr><td>Cash &amp; equivalents</td><td>Pinecrest Money Market Fund (money market mutual fund, 4.0%)</td><td>$24,000</td></tr><tr><td>Cash &amp; equivalents</td><td>1-year bank CD (4.5%)</td><td>$20,000</td></tr><tr><td>Taxable brokerage (joint)</td><td>Kestrel Diagnostics (KDX) &mdash; 4,000 sh @ $90</td><td>$360,000</td></tr><tr><td>Taxable brokerage (joint)</td><td>Harborline Large-Cap Growth Fund</td><td>$85,000</td></tr><tr><td>Taxable brokerage (joint)</td><td>Summit European Equity Fund (unhedged)</td><td>$37,060</td></tr><tr><td>Taxable brokerage (joint)</td><td>Ridgeway Intermediate Corporate Bond Fund</td><td>$60,000</td></tr><tr><td>Retirement</td><td>Graham 401(k) &mdash; 85% S&amp;P 500 index fund, 15% stable value</td><td>$410,000</td></tr><tr><td>Retirement</td><td>Nadia 401(k) &mdash; target-date fund</td><td>$295,000</td></tr><tr><td>Retirement</td><td>Nadia Roth IRA &mdash; total-market index fund</td><td>$62,000</td></tr><tr><td>Education</td><td>Leah education account (taxable, parents&rsquo; names) &mdash; stock index fund</td><td>$96,000</td></tr><tr><td>Education</td><td>Sam 529 plan</td><td>$41,000</td></tr><tr><td>Use assets</td><td>Residence</td><td>$780,000</td></tr><tr><td>Use assets</td><td>Vehicles</td><td>$55,000</td></tr><tr><td>Use assets</td><td>Personal property</td><td>$40,000</td></tr><tr><td><b></b></td><td><b>Total assets</b></td><td><b>$2,383,060</b></td></tr></tbody></table><p><b>Asset subtotals</b></p><table><thead><tr><th>Group</th><th>Subtotal</th></tr></thead><tbody><tr><td>Cash &amp; equivalents</td><td>$62,000</td></tr><tr><td>Taxable brokerage</td><td>$542,060</td></tr><tr><td>Retirement</td><td>$767,000</td></tr><tr><td>Education</td><td>$137,000</td></tr><tr><td>Use assets</td><td>$875,000</td></tr><tr><td><b>Total assets</b></td><td><b>$2,383,060</b></td></tr></tbody></table><p><b>Liabilities and net worth</b></p><table><thead><tr><th>Liability</th><th>Balance</th></tr></thead><tbody><tr><td>Mortgage (3.25%, about 15 years left)</td><td>$310,000</td></tr><tr><td>Auto loan</td><td>$18,000</td></tr><tr><td>Credit cards (paid monthly)</td><td>$4,000</td></tr><tr><td><b>Total liabilities</b></td><td><b>$332,000</b></td></tr></tbody></table><table><thead><tr><th>Measure</th><th>Amount</th></tr></thead><tbody><tr><td>Total assets</td><td>$2,383,060</td></tr><tr><td>Total liabilities</td><td>$332,000</td></tr><tr><td>Investment assets (taxable + retirement + education)</td><td>$1,446,060</td></tr><tr><td>KDX as % of investment assets</td><td>24.9%</td></tr><tr><td><b>Net worth</b></td><td><b>$2,051,060</b></td></tr></tbody></table><p><b>Annual cash flow</b></p><table><thead><tr><th>Annual inflows</th><th>Amount</th></tr></thead><tbody><tr><td>Graham salary</td><td>$165,000</td></tr><tr><td>Nadia salary</td><td>$185,000</td></tr><tr><td>Interest &amp; dividends</td><td>$9,600</td></tr><tr><td><b>Total inflows</b></td><td><b>$359,600</b></td></tr></tbody></table><table><thead><tr><th>Annual outflows</th><th>Amount</th></tr></thead><tbody><tr><td>Income &amp; payroll taxes</td><td>$98,000</td></tr><tr><td>401(k) deferrals (both)</td><td>$40,000</td></tr><tr><td>529 contribution for Sam</td><td>$12,000</td></tr><tr><td>Mortgage principal &amp; interest</td><td>$26,400</td></tr><tr><td>Property tax &amp; homeowners insurance</td><td>$15,600</td></tr><tr><td>Auto loan payments</td><td>$7,200</td></tr><tr><td>Food &amp; household</td><td>$24,000</td></tr><tr><td>Utilities &amp; phone</td><td>$9,600</td></tr><tr><td>Insurance premiums (life, disability, auto, umbrella)</td><td>$11,400</td></tr><tr><td>Transportation &amp; auto upkeep</td><td>$8,400</td></tr><tr><td>Children&rsquo;s activities &amp; school</td><td>$14,400</td></tr><tr><td>Travel &amp; entertainment</td><td>$18,000</td></tr><tr><td>Medical/dental out of pocket</td><td>$6,000</td></tr><tr><td>Charitable gifts</td><td>$9,000</td></tr><tr><td>Clothing &amp; personal</td><td>$12,000</td></tr><tr><td><i>Living expenses subtotal (= $13,500/month)</i></td><td><i>$162,000</i></td></tr><tr><td><b>Total outflows</b></td><td><b>$312,000</b></td></tr></tbody></table><table><thead><tr><th>Cash-flow summary</th><th>Amount</th></tr></thead><tbody><tr><td>Total inflows</td><td>$359,600</td></tr><tr><td>Total outflows</td><td>$312,000</td></tr><tr><td><b>Discretionary surplus</b></td><td><b>$47,600</b></td></tr></tbody></table><p><b>Taxable portfolio holdings</b></p><table><thead><tr><th>Holding (taxable account)</th><th>Value</th><th>Notes</th></tr></thead><tbody><tr><td>Kestrel Diagnostics (KDX) &mdash; 4,000 sh @ $90</td><td>$360,000</td><td>Basis $40/sh; beta 1.40; Nadia&rsquo;s employer</td></tr><tr><td>Harborline Large-Cap Growth Fund</td><td>$85,000</td><td>Basis $100,000; beta 1.15; expense ratio 1.25%; turnover 140%</td></tr><tr><td>Summit European Equity Fund (unhedged)</td><td>$37,060</td><td>Bought 1 yr ago for $36,000; beta 0.90</td></tr><tr><td>Ridgeway Intermediate Corporate Bond Fund</td><td>$60,000</td><td>SEC yield 5.2%; duration 6.2 yrs</td></tr><tr><td><b>Total taxable</b></td><td><b>$542,060</b></td><td><b></b></td></tr></tbody></table><p><b>Goals</b></p><ul><li>Hold a cash reserve equal to six months of living expenses.</li><li>Have Leah&rsquo;s first-year college money available in three years.</li><li>Both retire in about 12 years (Graham at 65, Nadia at 62).</li><li>Reduce reliance on Kestrel stock without a large immediate tax bill.</li><li>Keep investment costs and taxes low.</li></ul><p><b>Risk profile</b></p><ul><li>Joint questionnaire score: moderate.</li><li>Graham sold most of his stock funds near the bottom of a past bear market and says a 15% drop would cost him sleep.</li><li>Nadia is comfortable with volatility and would like an actively managed sleeve in emerging markets and REITs.</li><li>Graham prefers low-cost index funds and little trading.</li></ul><p><b>Planning assumptions</b></p><table><thead><tr><th>Assumption</th><th>Value</th></tr></thead><tbody><tr><td>Inflation</td><td>3.0%</td></tr><tr><td>13-week T-bill (risk-free rate)</td><td>4.0%</td></tr><tr><td>Expected market return</td><td>10.0%</td></tr><tr><td>Federal marginal bracket / state bracket</td><td>32% / 5% (they itemize deductions)</td></tr><tr><td>KDX beta / analysts&rsquo; expected return</td><td>1.40 / 11.0%</td></tr><tr><td>Return needed for retirement goal (planner&rsquo;s calculation)</td><td>6.5% per year</td></tr><tr><td>Nadia&rsquo;s trading status</td><td>Not a corporate insider; no trading restrictions</td></tr></tbody></table>","items":[{"q":"In which section of the Calloways' investment policy statement (IPS) should these two needs be recorded?","o":["Return requirement","Liquidity","Laws and regulations","Permitted and excluded investments"],"a":1,"e":"Liquidity constraints record money the clients must be able to reach: an emergency reserve and any known outlay within roughly the next three to five years, such as tuition. Many advisors keep money needed inside five years out of the stock market. The return requirement states the target return; laws and regulations mainly concern plans like ERISA trusts; permitted/excluded investments lists the clients&rsquo; preferences."},{"q":"Which statement best describes the Calloways' risk tolerance for the IPS?","o":["Low ability and low willingness; the IPS should target capital preservation and leave the 6.5% goal as is","High ability and high willingness; their net worth lets the IPS set above-average volatility","Low ability but high willingness; the planner should rely on the questionnaire score alone","High ability but low willingness; the IPS should record both and reconcile the risk level with the 6.5% requirement"],"a":3,"e":"Ability depends on resources and circumstances (wealth, income, insurance, horizon), and the Calloways&rsquo; is high. Willingness is emotional comfort with swings, and Graham&rsquo;s history shows it is low. The IPS addresses both, and the risk objective must fit the return requirement: if 6.5% needs more risk than they will accept, they must accept more risk, lower the goal, or do some of each."},{"q":"How large is the gap in the Calloways' emergency reserve, and what is the best way to close it?","o":["$19,000; add it to a money market holding from the cash-flow surplus or taxable assets","$19,000; arrange a 401(k) loan that can be drawn if an emergency occurs","$81,000; open a home equity line of credit to serve as the whole reserve","$39,000; leave the CD out of the reserve and draw the gap from the 401(k)s"],"a":0,"e":"Target = 6 &times; $13,500 = $81,000. Liquid assets = $18,000 + $24,000 + $20,000 = $62,000. Gap = $81,000 &minus; $62,000 = $19,000. The reserve belongs in highly liquid, marketable holdings such as a money market account so short-term setbacks never force a sale of long-term assets or new borrowing. Their $47,600 surplus can fill the gap within the year."},{"q":"Which response by the planner is most accurate?","o":["She is right; both accounts carry FDIC coverage up to $250,000 per ownership category","She is right only if the fund holds Treasury bills, which makes the fund itself FDIC insured","The mutual fund is not federally insured; a bank money market deposit account is insured up to $250,000 per ownership category","Neither account is insured, but only the bank account permits check-writing"],"a":2,"e":"Money market mutual funds are offered by open-end investment companies and are not federally insured, although they hold high-quality short-term paper and are very liquid. A money market deposit account (MMDA) is a bank obligation insured up to $250,000 per ownership category (2026 edition figure). Either can hold an emergency fund; the client simply needs to know the difference."},{"q":"What is the Calloways' after-tax, inflation-adjusted return on the T-bills?","o":["0.97%","&minus;0.27%","1.00%","&minus;0.47%"],"a":1,"e":"T-bill interest is federally taxed but state-exempt, so use 32% only (2026 edition figure). After-tax = 4.0% &times; (1 &minus; 0.32) = 2.72%. Real = [(1.0272 &divide; 1.03) &minus; 1] &times; 100 = &minus;0.27%. The roll-over keeps reserve money safe but loses purchasing power: fine for an emergency fund, a poor home for long-term money."},{"q":"What is the planner's best course of action with Graham?","o":["Keep a long-term perspective and hold the IPS allocation, reminding Graham why it was chosen","Move the 401(k) to stable value now and re-enter after the market regains half its loss","Shift half the 401(k) to stable value as a compromise to ease Graham&rsquo;s anxiety","Rewrite the IPS around capital preservation because a 25% decline changes their goals"],"a":0,"e":"With jobs, reserves and a 12-year horizon intact, the decline is market turmoil, not a change in the clients&rsquo; own situation. When a client presses to move to cash, the best course is usually no action: keep the allocation and the long view. Markets carry a long-term positive bias that rewards patient, diversified investors; abandoning the plan tends to leave clients on the sidelines early in a recovery."},{"q":"Which event(s) should prompt the planner to reassess the assumptions in the Calloways' IPS?","o":["I and III","II and III","III only","I, II, and III"],"a":2,"e":"Change comes in three kinds. Noise (II) carries no meaning and is ignored. Incremental change (I) is a small extension of an existing pattern and bears watching. Discontinuous change (III), such as losing a job, is a radical break that calls for revisiting the IPS assumptions: income, liquidity, risk capacity and the Kestrel holding."},{"q":"Which approach best reconciles the spouses' preferences for their retirement assets?","o":["Tactical asset allocation applied to the entire portfolio","A single moderate model portfolio from a fund sponsor&rsquo;s questionnaire","A strategic allocation held entirely in index funds with no active component","A core-and-satellite strategy: a passive index core plus a smaller active satellite sleeve"],"a":3,"e":"Core and satellite puts most assets in passive broad-market index funds (the core, run strategically) and a smaller share in higher-risk opportunities such as emerging markets, REITs or high-yield bonds (the satellite, run tactically). Its aims (diversification, returns in line with the required return, low transaction costs, tax management) fit both spouses."},{"q":"Which strategy best meets Nadia's goals for her Kestrel shares?","o":["Contribute the shares to an exchange fund","Transfer the shares to a charitable remainder trust","Give the shares to Leah and Sam","Sell the shares and buy a diversified index fund"],"a":0,"e":"An exchange fund takes concentrated public stock in return for a proportional interest in a diversified pool, spreading the company-specific (unsystematic) risk without an immediate capital gains tax, and Nadia keeps the value. A CRT avoids tax on the sale but leaves the remainder to charity; gifting gives up ownership; an outright sale taxes the $200,000 gain (4,000 &times; $50)."},{"q":"Ignoring commissions, what is the minimum net value of Nadia's hedged KDX position at expiration (the value the puts lock in, less the premium paid)?","o":["$300,000","$320,000","$350,000","$310,000"],"a":3,"e":"Premium = 40 contracts &times; 100 &times; $2.50 = $10,000. However far KDX falls, she can sell at $80: 4,000 &times; $80 = $320,000. Net floor = $320,000 &minus; $10,000 = $310,000, versus $360,000 today. A protective put works like insurance: she keeps the upside, but the cost recurs and coverage ends at expiration."},{"q":"Which option position should Nadia add to her 4,000 KDX shares?","o":["Buy 40 $80 puts and write 40 $105 calls with offsetting premiums","Write 40 $105 covered calls and nothing else","Write 40 $80 puts and buy 40 $105 calls","Buy 40 $90 calls and 40 $90 puts (a long straddle)"],"a":0,"e":"A zero-cost collar = long stock + long put + short call. The $80 put sets a floor; the premium received for the $105 call pays for the put, so the net cost is about zero. The trade-off: shares may be called away above $105. Covered calls alone cap the upside but give only premium-sized protection in a sharp drop."},{"q":"Using the CAPM, what is the required return on KDX, and what does it imply about adding to the position?","o":["18.0%; KDX is undervalued, so buy more","12.4%; the expected return falls short, so do not add to KDX","8.4%; the expected return exceeds it, so add to KDX","14.0%; KDX plots on the security market line, so hold it unchanged"],"a":1,"e":"CAPM: r = r<sub>f</sub> + (r<sub>m</sub> &minus; r<sub>f</sub>)&beta; = 4.0% + (10.0% &minus; 4.0%)(1.40) = 4.0% + 8.4% = 12.4%. The 11.0% expected return is below the 12.4% required, so KDX plots below the SML (priced too high for its systematic risk) and the CAPM test says reject further purchases. It supports the diversification plan."},{"q":"What is the weighted beta of the equity holdings in the joint brokerage account?","o":["1.15","1.40","1.32","1.07"],"a":2,"e":"Weighted beta = &Sigma;(value &times; beta) &divide; total value = ($504,000 + $97,750 + $33,354) &divide; $482,060 = $635,104 &divide; $482,060 = 1.32. The sleeve is about 32% more volatile than the market. With one stock at 75% of it, beta understates total risk, because company-specific risk has not been diversified away."},{"q":"Using the R² threshold taught in the course, which fund is the effective diversifier for Graham's account?","o":["Large-Cap Value Index, R² = 0.88","Mid-Cap Blend, R² = 0.79","International Developed Index, R² = 0.38","Dividend Growth, R² = 0.74"],"a":2,"e":"R² = R &times; R. Morningstar treats an R² above 70% (correlation above about 0.84) as too tied to the market to diversify an S&amp;P 500 holding. Only the international fund (0.62&sup2; = 0.38) is under 70%; most of its movement comes from factors other than the S&amp;P 500. A low positive correlation is enough; a negative one is not required."},{"q":"Which fund shows the better risk-adjusted performance, using the appropriate measure?","o":["Bexley, because its Treynor ratio (7.50) beats Alder&rsquo;s (7.24)","Bexley, because its return is 1.4 points higher than Alder&rsquo;s","Alder, because its higher R² shows it has the better manager","Alder, because its Sharpe ratio (0.48) beats Bexley&rsquo;s (0.41)"],"a":3,"e":"Bexley&rsquo;s R² of 0.58 is below 0.70, so its beta is unreliable and beta-based measures (Treynor, Jensen) are suspect. Use Sharpe = (R<sub>p</sub> &minus; R<sub>f</sub>) &divide; &sigma;. Alder: (11.6 &minus; 4.0) &divide; 16.0 = 0.48. Bexley: (13.0 &minus; 4.0) &divide; 22.0 = 0.41. Alder delivers more excess return per unit of total risk."},{"q":"Which of these statements about Harborline are CORRECT? I. Its high turnover adds trading costs not included in the 1.25% expense ratio. II. Its high turnover can produce capital gains distributions taxable to the Calloways. III. The expense ratio already includes the fund's brokerage commissions. IV. The manager's departure is a reason to monitor the fund more closely.","o":["I and III","II and IV","I, II, and IV","I, II, III, and IV"],"a":2,"e":"Turnover generates commissions, bid-ask spreads and market-impact costs, none of which appear in the expense ratio (I true; III false, since the ratio covers operating expenses, management fees and 12b-1 fees). High turnover can also realize gains that are distributed and taxed in a taxable account (II). Losing the manager behind the record calls for closer monitoring, though weaker results are not certain (IV)."},{"q":"What loss can the Calloways recognize on the December sale, and what is their basis in the repurchased shares?","o":["$15,000 loss; basis $82,000","$0 loss; basis $97,000","$3,000 loss; basis $94,000","$0 loss; basis $82,000"],"a":1,"e":"Buying the same security within 30 days before or after selling it at a loss (2026 edition figure) is a wash sale. The $15,000 loss ($85,000 &minus; $100,000) is postponed, not lost: it is added to the new shares&rsquo; basis, $82,000 + $15,000 = $97,000. Waiting more than 30 days to buy Harborline back would have kept the loss deductible."},{"q":"What is the municipal fund's taxable-equivalent yield for the Calloways, and which fund pays more after tax?","o":["5.29%; the municipal fund","5.71%; the municipal fund","5.57%; the municipal fund","5.57%; the corporate fund"],"a":2,"e":"Double tax-exempt bond, itemizer: TEY = tax-free yield &divide; [(1 &minus; state rate)(1 &minus; federal rate)] = 3.6% &divide; (0.95 &times; 0.68) = 3.6% &divide; 0.646 = 5.57%. The 32% and 5% brackets are case assumptions (2026 edition figure). Since 5.57% &gt; 5.2%, the municipal fund pays more after tax. Adding the brackets (3.6% &divide; 0.63 = 5.71%) applies only to non-itemizers."},{"q":"Which change makes the Calloways' asset placement most tax-efficient while keeping their overall stock/bond mix?","o":["Hold the taxable bond exposure in the 401(k) and keep tax-efficient index funds or municipals in the joint account","Buy municipal bonds inside Nadia&rsquo;s Roth IRA so the bond income is doubly tax-free","Keep the bond fund in the joint account, since its interest is taxed the same in any account","Swap the bond fund for taxable zero-coupon corporate bonds in the joint account to defer the interest"],"a":0,"e":"Tax-inefficient holdings (taxable interest, nonqualified dividends, high turnover) are best kept in tax-deferred accounts; tax-efficient ones (broad index funds, qualified dividends, municipals) can sit in taxable accounts. Swapping bonds into the 401(k) and stocks into the joint account keeps the same mix while sheltering interest now taxed at 32% federal and 5% state (2026 edition figure)."},{"q":"Using the duration formula, approximately what will the Calloways' Ridgeway position be worth after the rate increase?","o":["$56,280","$56,464","$63,536","$59,400"],"a":1,"e":"&Delta;P &divide; P = &minus;D &times; [&Delta;y &divide; (1 + y)] = &minus;6.2 &times; (0.01 &divide; 1.052) = &minus;5.89%. Change = &minus;0.0589 &times; $60,000 &asymp; &minus;$3,536, so the value is about $56,464. The rule of thumb (6.2 &times; 1%) gives $56,280. A bond fund never matures, so this price risk cannot be removed by holding on."},{"q":"Which fixed-income approach best protects the money for Leah's first tuition bill?","o":["A long-term bond fund with a duration of 14, for its higher yield","Three-year Treasury zero-coupon bonds, whose duration equals the three-year horizon","A barbell of 1-year and 20-year bonds","Keep the stock index fund, since stocks beat bonds over long periods"],"a":1,"e":"Matching a portfolio&rsquo;s duration to the time until the money is needed immunizes it: higher rates lower prices but raise reinvestment income, and vice versa. A zero-coupon bond&rsquo;s duration equals its maturity, so a 3-year Treasury zero delivers a known sum on schedule with no default or reinvestment risk. In a taxable account the accrued interest is taxed yearly (phantom income)."},{"q":"What was the Calloways' holding period return on the Summit fund in U.S. dollars?","o":["9.00%","15.41%","3.44%","2.94%"],"a":3,"e":"Convert at both ends: $36,000 &divide; 1.08 = &euro;33,333; &times; 1.09 = &euro;36,333; &times; $1.02 = $37,060. HPR = ($37,060 &minus; $36,000) &divide; $36,000 = 2.94%, or 1.09 &times; (1.02 &divide; 1.08) &minus; 1. The euro fell against the dollar, shrinking a 9% local gain to about 3%. A U.S. investor abroad wants the dollar to fall during the holding period."}]};
  /* FP513-GEN-END */
})();
