/* Kaplan slide-deck "Teach mode" narration — the teacher's script for the per-module
 * visual decks (apps/fp5XX-mN-kaplan-slides.html).
 *
 * This is the CONTENT for the 👩‍🏫 Teach button that reader-tts.js adds to a deck.
 * A deck is a single vertical-scroll page (no tabs, no collapsibles), so unlike the
 * reader's tab-keyed READER_TEACH this map is a FLAT ordered list per deck:
 *
 *   window.DECK_TEACH[<deck file name>] = [ {at, say}, … ]   // in slide order
 *     at  — a substring matched (case-insensitive) against a heading (.sect h2 /
 *           .slide h3) in the deck. The player scrolls to + highlights that slide
 *           while it speaks. Falls back to the deck top if not found / omitted.
 *     say — the teaching narration. reader-tts.js chunks it into flowing
 *           multi-sentence utterances at playback (natural cadence, under iOS's
 *           long-utterance cut-off).
 *
 * Grounded strictly in each deck's own (Kaplan-sourced, repo-audited) slide content,
 * matching the reader Teach voice. Decks are Teach-ONLY (no verbatim Podcast — a
 * visual deck of stat tiles/tables reads poorly aloud). Add a deck here, no engine
 * change. Precached in sw.js; injected before reader-tts.js.
 *
 * STATUS: pilot — FP512 Module 3 (Life Insurance) authored & anchor-verified. Roll out
 * to the other Kaplan decks (FP511 M2,4,5,6,7 + FP512 M1,2,4–8) the same way: author a
 * flat {at, say} list against that deck's slide headings, add the two <script> tags to
 * the deck HTML, and it plays with no engine change. */
(function () {
  'use strict';
  window.DECK_TEACH = window.DECK_TEACH || {};

  window.DECK_TEACH["fp512-m3-kaplan-slides.html"] = [
    {
      "at": "Why life insurance",
      "say": "Alright — welcome to Module 3, Life Insurance. Before we touch a single product, let's get the frame right, because everything in this module hangs off one idea. This whole first objective is about why life insurance exists and what you have to assume when you plan with it. Keep that split in your head as we go: the purpose is dead simple, but the inputs are where the exam plays games with you."
    },
    {
      "at": "job of life insurance",
      "say": "The job of life insurance is to provide a death benefit. That's it — the core purpose. Everything else is just what clients use that death benefit FOR. The common goals are paying off debt like a mortgage, loans, and credit cards; replacing lost income; funding college costs; and covering final expenses. Now here's the trap the exam loves. Final expenses means funeral costs, last-illness medical bills, an emergency fund, and estate taxes. What is NOT a final expense? Investment funds. Money set aside to invest is an asset the family already has — it is not an expense the death has to cover. So when a question lists four items and asks which one isn't a final expense, the investment account is your answer."
    },
    {
      "at": "Economic assumptions vs",
      "say": "Now the distinction they test constantly: economic assumptions versus client attributes. When you run a life insurance need, only two inputs are broad economic assumptions — the rate of return on investments, and the inflation rate over the period. Those are about the world, not the person. Everything else describes the individual client. Risk tolerance is a client attribute. Current resources available is a client attribute. Both matter enormously, but they are facts about this specific person, not assumptions about the economy. So when the exam asks which items are broad economic assumptions, you pick rate of return and inflation, and you leave risk tolerance and current resources in the client column."
    },
    {
      "at": "The product ladder",
      "say": "Okay, objective two — the products themselves. Think of these as a ladder, from the simplest pure protection up through the permanent policies where the client takes on more and more of the investment risk. We'll climb it one rung at a time: term, whole life, universal life, then the variable family. Learn where each one puts the risk and you've basically learned the module."
    },
    {
      "at": "Term life",
      "say": "First rung: term life — pure protection, nothing else. It covers a specific period, and the death benefit is level unless it's specifically a decreasing term policy, where the benefit declines over time, often tracking a shrinking mortgage balance. After the initial term it's typically annually renewable, and it's usually convertible to permanent coverage, with riders to customize it. That convertible feature is the tested detail. Picture Darla — she's healthy now, but has a family history of mid-life illness, not much cash today, and she wants the option to go permanent later without a new medical exam. The answer is convertible term: it locks in her insurability so a future health problem can't price her out."
    },
    {
      "at": "Whole life",
      "say": "Next rung: whole life — the permanent policy built on guarantees that don't change. It covers the insured's whole life and carries three guarantees you should be able to recite. Level premiums that never increase. A level death benefit. And guaranteed cash values that grow tax-deferred, with dividends able to accelerate that growth. That guaranteed cash value is the engine behind everything else in the contract — the loans, the nonforfeiture options, the dividends all run off of it. One variation to know: limited pay whole life. You pay higher premiums for a set number of years, and then the policy is paid up — no more premiums are ever due, but the coverage continues."
    },
    {
      "at": "Universal life",
      "say": "Universal life is the unbundled cousin. Where whole life hides the moving parts, UL pulls them apart and shows them to you separately — the cost of insurance, the policy expenses, and the interest credited are all itemized. It gives you flexible premiums and an adjustable death benefit, with both a current interest rate and a guaranteed floor, and it can even be indexed. Now the two death-benefit designs, because the exam adores this one. Option A holds the total death benefit level: as cash value rises, the net amount at risk falls. Option B pays the face amount PLUS the cash value, so the total death benefit increases over time. And here's the UL trap: universal life does NOT lend itself to a compulsory savings program. Because the premiums are flexible, owners can underpay, and the policy can quietly turn into expensive term insurance."
    },
    {
      "at": "Variable, VUL",
      "say": "Top of the ladder — the variable family, where the owner takes on the investment risk. Variable life is permanent with a guaranteed death benefit, but the cash value sits in subaccounts, and the owner bears the investment risk on those. VUL combines universal life's premium flexibility with those variable subaccounts. And EIUL, equity-indexed universal life, credits a minimum fixed rate in down markets, plus limited index participation in up markets — but that upside is subject to participation and rate caps. A couple of details they slip in: subaccounts resemble mutual funds but aren't the same — different structure, fees, and performance, and no need for internal tax efficiency since the whole thing already grows tax-deferred. EIUL runs two accounts, a guaranteed interest account and a variable indexed one, and its crediting methods have names worth recognizing: percent change, ratchet or point-to-point, spread, and high-water mark."
    },
    {
      "at": "One table to compare",
      "say": "Let's pull all of that into one comparison, because if you can reproduce this table you can answer most product questions on sight. Term: a set period, level premium during the term, no cash value, no investment risk to speak of. Whole life: permanent, level fixed premium, guaranteed cash value, and the insurer bears the risk. Universal life: permanent, flexible premium, cash value that earns interest, with the insurer bearing interest-rate risk down to the guaranteed floor. Variable and VUL: permanent, cash value in subaccounts, and the OWNER bears the investment risk. EIUL: permanent, flexible premium, indexed cash value, with the risk shared but capped. The single most testable column is that last one — who bears the investment risk — so read it left to right until it's automatic."
    },
    {
      "at": "Other policy types",
      "say": "A few other policy types round out the shelf. Adjustable life lets you reconfigure the face amount, premium, and term over time. Joint or first-to-die pays on the first insured's death. Second-to-die, also called survivorship, pays only at the LAST death — and that's the one to flag for the exam. It's the estate-planning workhorse: it creates liquidity to pay estate taxes at the second spouse's death, it's cheaper than buying two separate policies, and it can still work when one of the two insureds is older or in poor health and hard to insure alone. And low-load life simply strips down the sales-load structure. When a case screams estate liquidity for a married couple, second-to-die is your instinct."
    },
    {
      "at": "MEC",
      "say": "Now objective 3.2.5 — the modified endowment contract, and how life insurance gets taxed. This is where a lot of points live, so slow down with me. A MEC is a policy that's been overfunded — it fails the seven-pay test, which means the deposits in the first seven years exceed seven annual net level premiums. You paid in too much, too fast, and the tax code pushes back. Three numbers to lock in. Seven-pay is the test that triggers MEC status. LIFO is how the money comes out — last in, first out, so loans and withdrawals are taxed gains-first. And ten percent is the penalty on the gain if you access it before age fifty-nine and a half. Crucially, the death benefit keeps its normal tax status — it's the LIVING access, the loans and withdrawals, that gets penalized. And which policies can even become a MEC? Whole life, universal life, and variable universal life — NOT term. Term has no cash-value capacity to overfund, so it can never be a MEC."
    },
    {
      "at": "Taxation of life insurance",
      "say": "Here's the taxation grid, and it's cleaner than it looks once you see the pattern. Term: the death benefit is income-tax-free, and there's no cash value to worry about. Non-MEC cash value — that's a properly funded whole life, UL, VUL, or EIUL — grows tax-deferred, the death benefit is income-tax-free, withdrawals are taxed only on gains above your basis, and policy loans are income-tax-free. A MEC has the exact same tax-deferred growth and the same income-tax-free death benefit — the ONLY thing that changes is living access: now both loans and withdrawals are taxable on any gains, LIFO, and penalized before fifty-nine and a half. So the whole MEC story reduces to one sentence: it looks like a normal policy until you try to touch the cash while alive. And one asterisk that carries into estate planning — the death benefit is income-tax-free, but it may still face estate tax."
    },
    {
      "at": "Common contractual provisions",
      "say": "Objective 3.3 — the provisions, options, and riders. Start with the standard contractual provisions, the fine print every policy carries. The grace period is the time you get to pay a late premium before the policy lapses. The incontestability clause means that after a set period the insurer can no longer contest the policy. The suicide clause is an exclusion window early in the policy's life. The reinstatement clause lets you restore a lapsed policy if you meet the conditions. And misstatement of age or gender: if the insured's age or gender was stated wrong, the insurer doesn't void the policy — it simply adjusts the benefit to what the premiums actually paid would have bought at the correct age. Nobody gets a windfall, nobody gets robbed; the math just gets corrected."
    },
    {
      "at": "Beneficiary designations",
      "say": "Beneficiary designations — a few clean rules and one trap. Primary versus contingent: the primary beneficiary is paid first, and the contingent, or secondary, is paid only if no primary survives. Revocable versus irrevocable: a revocable beneficiary can be changed anytime by the owner, while an irrevocable beneficiary can't be changed without that beneficiary's consent. And there's no limit to the number of beneficiaries you can name within a class. Now the trap. Most beneficiary designations are REVOCABLE — only a small percentage are irrevocable. If an exam statement claims most designations are irrevocable, that statement is false. And a small factual tag they use: spouses are the most commonly named primary beneficiaries."
    },
    {
      "at": "Three sets of options",
      "say": "This slide is pure exam defense: three different sets of options that all sound similar, and the test deliberately mixes them up. Set them apart now. Nonforfeiture options are what you get if you STOP paying — cash surrender value, reduced paid-up insurance, or extended term insurance. Dividend options apply to participating policies, to what you do with the dividend — take it in cash, use it to reduce or offset the premium, let it accumulate at interest, buy paid-up additions, or the fifth option, one-year term. And settlement options are how the death benefit gets paid OUT to the beneficiary — the interest option, the fixed-period option, the fixed-amount option, and the life income options. The one most people confuse with annuity payouts is that settlement column, so memorize it as its own distinct set: nonforfeiture is if you quit, dividends are for participating policies, settlement is how the death benefit is delivered."
    },
    {
      "at": "Policy riders",
      "say": "Riders are the add-ons that customize a policy. The disability waiver of premium waives your premiums if the insured becomes disabled. The guaranteed insurability option, or GIO, lets you buy additional cash-value coverage on the named insured later, with no new medical exam — it protects future insurability. The accidental death benefit, ADB, was historically called double indemnity. Term riders add term coverage on the insured, a spouse, or children. The accelerated death benefit lets you tap the death benefit early if the insured is terminally ill. And there's a whole family of common customizations — critical illness, long-term care, family income, and return of premium riders. You don't need to memorize every clause, but recognize what each rider does when a scenario describes the need."
    },
    {
      "at": "How much",
      "say": "Objective 3.4 — the question every client actually asks: how much do I need? There are a few recognized ways to size it, and the exam wants you to know the mechanics and the watch-outs for each. Let's walk the methods, then the framework that totals it all up."
    },
    {
      "at": "Three methods",
      "say": "Three methods, plus the LIFE framework. The multiple-of-salary method is the rule of thumb — salary times a number of years — simple but imprecise. Human life value is the present value of the client's future earnings, discounted back to today; note it's income-only, and it depletes capital, meaning the payout is designed to be spent down to zero. Income replacement comes in two flavors that are worth distinguishing: capital utilization spends down the principal over time, while capital retention lives on the interest and keeps the principal intact — and because it never touches principal, retention always requires a larger sum. Then LIFE ties it together as a checklist: Liabilities, Income replacement, Final expenses, and Education — add those up, subtract any existing insurance, and what's left is the amount of new coverage needed."
    },
    {
      "at": "Worked example",
      "say": "Let's actually work an education-funding need, because this is the kind of multi-step calculation the exam builds a question around. Wayne wants insurance to fund college for his son Mark, who's four now and starts college at eighteen — a four-year program. Tuition today is twenty-five thousand dollars, college inflation is six percent, and the funds will earn eight percent. Three steps. Step one: inflate today's cost forward to the first year of college, fourteen years out — twenty-five thousand at six percent for fourteen years grows to about fifty-six thousand five hundred. Step two: find the present value of that four-year stream of payments, using the inflation-adjusted rate — take one-point-oh-eight divided by one-point-oh-six, subtract one, and you get roughly one-point-eight-nine percent; run four payments in BEGIN mode and you get about two hundred nineteen thousand. Step three: discount that lump sum back the fourteen years at eight percent. The result — about seventy-four thousand eight hundred — is what you add to Wayne's life insurance need for education. Notice the pattern: inflate the cost forward, present-value the college years, then discount home."
    },
    {
      "at": "Recommend, keep-or-replace",
      "say": "Last objective — 3.5 — recommending, and the keep-or-replace decision, including the 1035 exchange. This is where you put the products and the taxation together and actually advise. Two big ideas here: when replacing a policy is a bad deal, and which exchanges the tax code lets you do tax-free."
    },
    {
      "at": "Keep or replace",
      "say": "When a client asks whether to replace an existing policy, there's a checklist of factors that usually argue AGAINST it. You pay new acquisition costs — that front-end load hits all over again. You give up the values built in the existing policy. The contestability and suicide-clause periods RESTART on the new policy, which reopens risk that had already closed. Dividends on a brand-new policy are likely lower at first, and so are the initial cash values. And the replacement may simply not fit the client's needs as well. So the rule of thumb: if you need permanent coverage and you already hold term, converting that term through its own conversion clause is usually the best and least-expensive path. Replacing an in-force cash-value policy with a similar one is seldom advantageous once the policy has been on the books for a while."
    },
    {
      "at": "1035 exchanges",
      "say": "And the 1035 exchange — which directions are allowed tax-free. Think of it as a one-way street. From a cash-value life policy you can go to another life policy, to an annuity, to a MEC, or to a long-term-care combo — life is the most flexible starting point. A MEC can exchange to an annuity, to a similar MEC, or to an LTC combo, but a MEC can NOT become a regular life policy. And an annuity can go to another annuity or an LTC combo, but never to a life policy and never to a MEC. So the line to memorize: you can go life to annuity, but never annuity to life. Money that's grown inside an annuity can't be laundered into the tax-free death benefit of life insurance — the code closes that door. That's Module 3 end to end: the purpose and the two economic assumptions, the product ladder and where each puts the risk, MEC and the taxation grid, provisions and the three option sets, sizing the need, and finally recommending and exchanging. Nice work."
    }
  ];
})();
