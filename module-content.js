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
        1: [ { src: 'assets/infographics/FP512-M1-Insurance-and-Risk-Management-Guide.png', title: 'Insurance and Risk Management Guide' } ],
        2: [ { src: 'assets/infographics/FP512-M2-Insurance-Professional-Exam-Quick-Reference.png', title: 'Insurance Professional Exam Quick Reference' }, { src: 'assets/infographics/FP512-M2-Property-and-Casualty-Exam-Guide.png', title: 'Property and Casualty Exam Guide' } ],
        3: [ { src: 'assets/infographics/FP512-M3-Life-Insurance-Reference-Guide.png', title: 'Life Insurance Reference Guide' } ]
      }
    };
  /* INFOGRAPHICS-GEN-END */

  // Per-module slide decks (NotebookLM / AI slide PDFs). Course -> module -> [{src,title}].
  // GENERATED from assets/slides/ by scripts/sync_media.mjs — same markers/rules as
  // infographics; PDFs are runtime-cached on first view (not precached — too large).
  /* SLIDES-GEN-START */
  window.SLIDES = {
      FP512: {
        1: [ { src: 'assets/slides/FP512-M1-Principles-of-Insurance-and-Risk-Management.pdf', title: 'Principles of Insurance and Risk Management' } ],
        2: [ { src: 'assets/slides/FP512-M2-Property-and-Casualty-Blueprint.pdf', title: 'Property and Casualty Blueprint' } ]
      }
    };
  /* SLIDES-GEN-END */

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
})();
