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
})();
