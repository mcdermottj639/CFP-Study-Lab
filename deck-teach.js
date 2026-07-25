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
 * STATUS: complete for all 13 Kaplan per-module decks — FP512 M1–M8 + FP511 M2,4,5,6,7
 * (352 {at,say} entries; each section intro + per-slide, quiz sections skipped). Every
 * anchor is a verbatim heading substring, runtime-verified against the real deck headings
 * and in document order (scripts/scratchpad harness). Authored via one grounded author per
 * deck (each read only its own deck + heading brief) matching the pilot voice. To add a new
 * course's decks (FP513+), author a flat {at, say} list against that deck's slide headings,
 * add the two <script> tags to the deck HTML, and it plays with no engine change. The
 * whole-course AI decks are intentionally left Teach-free. */
(function () {
  'use strict';
  window.DECK_TEACH = window.DECK_TEACH || {};

  window.DECK_TEACH["fp512-m1-kaplan-slides.html"] = [
    {
      "at": "Concepts of risk — terms",
      "say": "Alright — welcome to Module 1, the principles of insurance and risk management. This whole first objective is vocabulary, and it feels easy, but the exam turns these terms into two-plausible-answer traps. So slow down with me. We're going to nail down how risk is classified, and then the peril-versus-hazard distinction that the test loves to swap on you. Get these words exactly right and you'll pick off points other people give away."
    },
    {
      "at": "Three ways to classify risk",
      "say": "Okay, risk gets sorted along three pairings. First, static versus dynamic: static risks happen in a stable economy — think fire or theft — while dynamic risks come out of economic change. Second, fundamental versus particular: fundamental risks hit groups or society as a whole, while particular risks hit specific individuals. Third, and this is the one that matters most, pure versus speculative. A pure risk is a chance of loss or no loss — that's it, no upside. A speculative risk carries a chance of loss or gain. Here's the rule to know cold: insurance handles pure risk only. Because speculative risk includes a chance of gain, it is not insurable. So when a question describes something with an upside — an investment, a business venture — that's speculative, and your instinct should be, you can't insure that."
    },
    {
      "at": "Peril vs. hazard",
      "say": "Now the classic swap. A peril is the cause of a loss — fire, flood, storm, a collision. A hazard is different: it's a condition that increases the chance or the severity of a loss. The textbook example is an oily rag left in a garage. The rag doesn't destroy anything by itself — but it makes a fire more likely, so it's the hazard. Here's the trap, and it's the exact trap the exam sets: when a fire, a flood, or a storm actually destroys property, that destroying event is a peril, not a hazard. The hazard is the underlying condition sitting in the background making the loss more likely. So the tell is: cause of the loss equals peril; condition that raises the odds equals hazard. Read the question for which role the thing is playing."
    },
    {
      "at": "The risk-management process",
      "say": "Okay, this objective is a sequence — the seven-step risk management process. The exam almost never asks you to recite all seven; instead it drops you in at one step and asks what comes next. So it's the ORDER that's tested, especially the front end. Let's walk it."
    },
    {
      "at": "Seven steps, in order",
      "say": "Here are the seven steps in order. Step one, identify and establish your risk management goals. Step two, gather the pertinent data to determine your risk exposures. Step three, analyze and evaluate that information. Step four, develop the risk management plan. Step five, communicate it. Step six, implement the recommendations. And step seven, monitor and adjust over time. Now here's the piece they test hardest. Right after step one — after you've identified and established your goals — the very next thing is step two, gather pertinent data. Don't let the answer choices tempt you into jumping straight to develop a plan; you can't build a plan before you've gathered data and analyzed the exposures. Identify, then gather, then analyze, then develop. Lock that front-end sequence in."
    },
    {
      "at": "Handling risk — control, financing",
      "say": "Now that you've identified a risk, how do you actually handle it? This objective gives you the four methods, split into two families, and then a matrix that tells you which method fits which kind of loss. This is heavily tested, so let's be precise about the four names and where each one belongs."
    },
    {
      "at": "Risk control vs. risk financing",
      "say": "There are four methods of addressing risk, and they fall into two categories. The first category is risk control, and it has two methods: avoidance, which means you eliminate the exposure entirely, and reduction, which means you lower the frequency or the severity of a loss. The second category is risk financing, also with two methods: retention, where you keep the risk and pay the losses yourself, and transfer, where you shift the risk to an insurer — that's buying insurance. So the four are avoidance, reduction, retention, and transfer. Keep the categories straight: control is about changing the physical exposure — avoid it or shrink it — while financing is about who pays when a loss happens — you keep it, or you hand it off. Don't rename these or mix up which family they sit in; the exam builds distractors out of exactly that confusion."
    },
    {
      "at": "The risk-management matrix",
      "say": "The matrix matches the technique to two dimensions of a loss: frequency, meaning how often it happens, and severity, meaning how costly it is when it does. Walk the four cells with me. High frequency and high severity — avoidance or reduction; those losses are too common and too costly to keep. High frequency but low severity — retention or reduction; they happen a lot but they're cheap, so you absorb them. Low frequency and low severity — retention; rare and cheap, just keep it. And the money cell for the exam: low frequency but high severity — transfer. That's the rare-but-devastating loss, and that's exactly what insurance is built for. The anchor example is a brand-new luxury sedan's collision exposure: it probably won't happen, but if it does it's expensive — high severity, low probability — so you transfer it to an insurer."
    },
    {
      "at": "Self-insurance — a form of retention",
      "say": "Here's a favorite trap. Self-insurance is NOT true insurance, because there's no transfer of risk to anybody else. It's actually a formal, organized way of retaining risk — you're funding your own losses on purpose. To do it properly you need a few things: enough homogeneous exposure units so losses are predictable, adequate funds set aside to cover those losses, the ability to administer the insurance functions yourself, and competent management of the fund's investments. But strip all that away and the exam point is simple: self-insurance is retention, not transfer — even though calling yourself your own insurer makes it feel like transfer. If a question describes a company setting aside its own money to pay its own claims and asks which technique that is, the answer is retention."
    },
    {
      "at": "Elements of an insurable risk",
      "say": "So what makes a risk actually insurable? It starts with the law of large numbers: an insurer needs enough homogeneous exposure units — a big pool of similar risks — so that losses become reasonably predictable. That predictability is the foundation of the whole business. Beyond the law of large numbers, the loss itself has to meet three conditions. It has to be definite and measurable, meaning you can determine and quantify it. It has to be fortuitous or accidental, meaning unexpected and outside the insured's control. And it has to be not catastrophic — not so ruinous that it would sink the insurance company. When the exam asks which requirement a situation fails, check it against these: is the loss vague, is it deliberate, or is it so massive it would bankrupt the insurer?"
    },
    {
      "at": "The client's life cycle",
      "say": "Quick framing slide — the client's financial life cycle, which sets the context for planning. There are three phases. Asset accumulation is the building-wealth phase, early to mid career. Conservation, or protection, is about protecting the assets you've accumulated. And distribution, or gifting, is spending down and transferring that wealth later in life. It's a simple arc — accumulate, protect, distribute — and it helps you match a client's insurance and planning needs to where they are in that arc."
    },
    {
      "at": "Agents, brokers",
      "say": "Now the agency relationship — who represents whom, and who has the power to bind the insurance company. This is pure legal distinction, and it's the kind of thing the exam can test in one clean sentence. Two pieces: agent versus broker, and then the three types of authority an agent can hold."
    },
    {
      "at": "Agent vs. broker",
      "say": "Here's the distinction that decides these questions: an agent represents the insurer — the principal — while a broker represents the insured. That single fact drives everything else. Because the agent acts for the insurer, the agent has authority to bind the insurer; the agent's acts create a legal obligation for the insurance company. A broker does not have that authority — a broker binds only themselves. So the one-liner to memorize is: an agent acts for the insurer, a broker acts for the insured, and only the agent can bind the insurance company. When a scenario turns on whether the company is on the hook for what a producer did, first ask, were they an agent or a broker?"
    },
    {
      "at": "Three types of agency authority",
      "say": "An agent can hold three types of authority. Express authority is the power explicitly granted to the agent by the insurer — it's spelled out. Implied authority is the power reasonably necessary to carry out that express authority — the stuff that has to come along with the job even if it isn't written down. And apparent authority, also called ostensible authority, is what the public reasonably believes the agent can do. That third one is the tested trap. Suppose an insurer privately told its agent not to write a certain policy, but the agent writes it anyway. The company is still bound, because the public reasonably believed the agent had the authority to do it. Apparent authority binds the insurer regardless of the secret instruction. So the tell is: private instruction the customer never knew about doesn't protect the company — apparent authority still binds them."
    },
    {
      "at": "State & federal regulation",
      "say": "Okay, who actually regulates insurance — states or the feds? The answer today is mostly states, but there's a specific chain of court cases and one act that got us here, and the exam loves that timeline. Let's walk the three landmarks and then who does what."
    },
    {
      "at": "The three landmark cases",
      "say": "Three dates, in a chain. Eighteen sixty-eight, Paul versus Virginia: the court held that insurance is not interstate commerce, so the states get to regulate it. That stood for decades. Then nineteen forty-four, U.S. versus Southeastern Underwriters Association: that ruling reversed Paul versus Virginia and said insurance IS interstate commerce, which opened the door to federal reach. But the very next year, nineteen forty-five, Congress passed the McCarran-Ferguson Act, which handed regulation back to the individual states — with a couple of exceptions carved out for fair labor standards and antitrust. So the arc is: states regulate, then briefly the feds could, then McCarran-Ferguson sends it back to the states. Bottom line for the exam: insurance is regulated primarily by the individual states, through their departments of insurance, under McCarran-Ferguson. Remember the order — Paul, then Southeastern reverses it, then McCarran-Ferguson restores state control."
    },
    {
      "at": "Who does what — direct vs. indirect",
      "say": "This slide sorts the players into direct versus indirect regulators, and there's one trap sitting right in the middle. The state departments of insurance regulate the industry directly — they're the real, hands-on regulators. The NAIC — the National Association of Insurance Commissioners — only makes recommendations; it regulates indirectly and is not itself a regulator. State legislatures pass the laws that the departments then enforce, so they're indirect too. The IRS and Dodd-Frank are federal and touch insurance only indirectly. And you've got federal health-insurance statutes — the ACA from twenty-ten, COBRA from nineteen eighty-five, and HIPAA from nineteen ninety-six — that affect coverage. Here's the trap, stated plainly: the NAIC does NOT directly regulate insurers. It issues model recommendations, and that's it. If a question asks which body provides direct regulation, the answer is the state departments of insurance — never the NAIC."
    },
    {
      "at": "Insurance contract law",
      "say": "Now insurance contracts as legal documents. Insurance contracts have some special characteristics that ordinary contracts don't, plus the general requirements every enforceable contract needs, plus two doctrines that can limit a party's rights. Let's take those in turn — and watch the vocabulary, because these terms are exactly the kind the exam tests one word at a time."
    },
    {
      "at": "Special legal characteristics",
      "say": "Insurance contracts carry seven special characteristics. Aleatory: the two parties exchange unequal value — a small premium against a potentially huge benefit. Adhesion: it's a take-it-or-leave-it contract drafted entirely by the insurer, which is why any ambiguity gets read in favor of the insured. Conditional: benefits are owed only if the stated conditions are met. Indemnity: it restores the insured to their pre-loss position — no profit from a loss. Personal: it insures the person or interest, not just the property itself. Unilateral: only the insurer makes a legally enforceable promise. And utmost good faith: both parties rely on each other's honesty and full disclosure. The most-tested of these is aleatory. The reason it's aleatory is precisely that premiums and benefits are of unequal value, and the outcome hinges on a chance event. So if a question hangs on the unequal-value idea, aleatory is your word."
    },
    {
      "at": "Legal requirements for an enforceable contract",
      "say": "Beyond those special traits, an insurance contract still needs the five general requirements of any enforceable contract: offer and acceptance, consideration, legal object, competent parties, and legal form. Now the trap, because it packs several tested facts. The applicant must be a competent party — that's a real requirement. But watch the edges: a contract entered into by a minor is still valid; it's just voidable by the minor only, not by the insurer. The parties do NOT have to exchange equal value — remember, insurance is aleatory. And the applicant has no right to alter the contract's provisions. So if an answer choice says the parties must give up things of equal value, or that the applicant can change the terms, those are wrong. The real requirement in that set is that the applicant be a competent party."
    },
    {
      "at": "Waiver vs. estoppel",
      "say": "Two doctrines that both limit a party's rights, and the exam pairs them to see if you can tell them apart. Waiver is the voluntary relinquishment of a known right — a party, by their own actions, deliberately gives up a right they know they have. Estoppel is different: it prevents a party from asserting a known right because someone else relied on that party's conduct to their own detriment. So the tell is intent versus reliance. Waiver is you choosing to let a right go. Estoppel is the law stopping you from claiming a right because the other side reasonably relied on how you behaved and would be harmed if you flipped. Same neighborhood, different trigger — voluntary give-up versus reliance-based bar."
    },
    {
      "at": "Liability, torts",
      "say": "Now liability — the world of lawsuits, and what liability insurance actually protects against. We'll separate criminal wrongs from civil ones, break down the types of torts and the elements of negligence, and then cover the three types of damages, including the one type that is not insurable. Precision on the vocabulary matters here."
    },
    {
      "at": "Criminal vs. tortious behavior",
      "say": "Start by splitting wrongs into two classes. A public wrong is a crime — a violation of criminal law — and the redress is a jail term and slash or fines; that's the state punishing you. A private wrong is a tort — an infringement of an individual's rights under civil law — and the redress is monetary damages paid to the person you harmed. The key connection for this module: liability insurance protects against tort liability — the private, civil wrong — where one person infringes on another's rights and can be sued for damages. It does not, and cannot, cover criminal punishment. So when you see a liability question, you're in the tort world: private wrong, money damages."
    },
    {
      "at": "Types of torts",
      "say": "Torts come in three flavors. Intentional torts are deliberate. Negligence is the failure to act prudently — it's unintentional. And vicarious liability is being held responsible for a tort that someone else actually committed. Now zoom in on negligence, because the four elements are heavily tested. To prove negligence you need all four: a duty owed, a breach of that duty, damages or losses, and proximate cause linking the breach to the harm. Against a negligence claim there are three defenses: assumption of risk, contributory negligence, and comparative negligence. One more concept to flag — strict liability. Under strict liability a party is held liable for damages from their actions or products whether or not they were at fault. So negligence needs fault proven through those four elements; strict liability skips the fault question entirely."
    },
    {
      "at": "Three types of damages",
      "say": "Three types of damages, and one of them is the exam's favorite trap. Special damages are specific, measurable out-of-pocket losses — medical bills, repair costs, the receipts you can add up. General damages are non-economic losses, like pain and suffering, where there's no invoice. And punitive damages are extra damages imposed to punish reckless or intentional wrongdoing. Here's the trap, and know it cold: punitive damages are NOT insurable. Their entire purpose is to punish a wrongdoer who acted recklessly or on purpose, so as a matter of public policy an insurer will not — and generally cannot — cover them. If a scenario tacks on a big extra sum to punish the defendant and asks whether insurance pays it, the answer is no; those are punitive and uninsurable."
    },
    {
      "at": "Underwriting & loss adjustment",
      "say": "Now the operational side — how insurers decide whom to cover and what happens when a claim comes in. We'll hit underwriting and its possible outcomes, four core principles you have to know cold, and the duties each party owes at claim time. There's a big insurable-interest timing point buried in here, so stay with me."
    },
    {
      "at": "Underwriting — evaluating",
      "say": "Underwriting is the process of evaluating an applicant's risk. Based on that evaluation, the insurer decides how much coverage to provide and at what price. There are three possible results. The policy can be issued as applied for — that's standard acceptance, the applicant's a normal risk. It can be issued with modifications — rated or with altered terms, meaning they'll cover you but on different conditions, often at a higher premium. Or it can be declined — coverage is refused outright. So underwriting isn't just yes or no; there's that middle path of issuing with modifications, and the exam likes to make sure you know all three outcomes exist."
    },
    {
      "at": "Core principles of risk",
      "say": "Four principles to know cold. Adverse selection: the people with the highest risk are the ones most likely to want to buy insurance — which is exactly why insurers underwrite. Insurable interest: the insured must stand to actually incur a loss. A deductible: the amount the insured pays before the insurer pays anything. And exclusions: the perils the policy specifically does not cover. Now the tested detail on insurable interest — the timing differs by product. For life insurance, the insurable interest need only exist when the policy is issued. For property and casualty, the interest must exist when the loss is claimed. Apply it: you can insure your own home, your spouse's life, and your adult son's boat — but you can't insure your neighbor's home, because you'd suffer no loss. That home-versus-neighbor's-home example is a common exam setup."
    },
    {
      "at": "Loss adjustment — duties",
      "say": "When a loss happens, both sides have duties, and the exam sometimes asks which party owes which. The insured's duties are: provide notice of the loss, protect the property from further damage, and cooperate with the insurer during the process. The insurer's duties are: investigate the claim, then repair, replace, or declare it a total loss, and apply the pair-or-set clause where relevant — that's the rule for when part of a matched set is damaged. So the split is intuitive once you see it: the insured reports, protects, and cooperates; the insurer investigates and settles. Don't cross the columns."
    },
    {
      "at": "Selecting agents & companies",
      "say": "Last objective — how to choose an agent and how to evaluate an insurance company. These are two different checklists, and the whole point of the objective is that the exam tests whether you can tell an agent quality from a company quality. Let's separate them, and then close with the mutual-versus-stock ownership distinction."
    },
    {
      "at": "Agent vs. company selection criteria",
      "say": "Two different checklists, and the exam deliberately mixes them. When you're selecting an AGENT, you look at the person: competence, inclination to service, experience, training, education and specialization, and reputation. When you're evaluating a COMPANY, you look at the institution: financial strength and integrity, the ratings from agencies like A.M. Best and Moody's, financial ratios and the NAIC watchlist, the types of policies available, whether policies are participating or nonparticipating, and the form of ownership. Here's the trap: financial strength is a COMPANY criterion, not an agent criterion. If a question asks which item does NOT belong on the list for choosing an agent, financial strength is the answer — that's about the company backing the coverage, not the individual selling it."
    },
    {
      "at": "Mutual vs. stock companies",
      "say": "Finally, two forms of insurer ownership. A mutual company is owned by its policy owners, and its profits go back to those policy owners in the form of dividends — which is why mutual companies typically issue participating policies. A stock company is owned by its stockholders, and its profits go to those stockholders, so stock companies typically issue nonparticipating policies. The clean link to remember: mutual equals policyowner-owned equals participating, because the profits flow back to the policyholders as dividends. Stock equals stockholder-owned equals nonparticipating. So if a question says a policy pays dividends to its owners and asks what kind of company issued it, that's a mutual company with a participating policy. That closes out Module 1 — risk terms, the seven-step process and the four handling methods, agency and regulation, contract law, torts and damages, underwriting, and finally selecting your agent and your company. Nice work."
    }
  ];

  window.DECK_TEACH["fp512-m2-kaplan-slides.html"] = [
    {
      "at": "Homeowners forms, perils",
      "say": "Alright, welcome to Module 2 — Property and Casualty Insurance. This first objective is all about the homeowners policy: how it's built, which perils it covers, and the different HO forms. The engine of this whole section is one table you have to know cold, but let's build up to it so it actually makes sense instead of being a wall of letters."
    },
    {
      "at": "standard homeowners policy",
      "say": "Okay, start with the skeleton. Every homeowners policy splits into two sections. Section One is Property — that protects the dwelling, the structures, and your belongings, and it holds Coverages A through D. Section Two is Liability — that covers acts that happen on the homeowner's property, and it holds Coverages E and F. Learn the letters now, because they run through everything. A is the dwelling, the house itself. B is other structures — the detached garage, the fence, the shed. C is personal property, your contents and belongings. D is loss of use, meaning additional living expenses while you're displaced from the home. Then over in Section Two, E is personal liability, comprehensive coverage for injury or damage you cause others, and F is medical payments to others, which pays regardless of fault. Six coverages, two sections — that's the frame."
    },
    {
      "at": "Perils — Basic vs. Broad vs. Open",
      "say": "Now, forms differ by which perils they insure against, and there are three tiers. Basic is a named-peril list — fire, lightning, windstorm, hail, explosion, riot, civil commotion, vehicles, aircraft, smoke, vandalism and malicious mischief, theft, and volcanic eruption. Broad adds six more categories on top, things like falling objects, weight of ice, snow or sleet, collapse of buildings, accidental discharge or overflow of water, freezing of plumbing, and damage from artificially generated electrical currents. Open peril, also called all-risk, is the broadest — it covers any peril that is NOT specifically excluded. And here's the exam trap, so flag it: open peril does not mean everything is covered. It means everything except the named exclusions. When a question dangles all-risk, your instinct should be to go read the exclusions list. One more piece — the HO-15 rider gets added to an HO-3 to upgrade personal property to open-peril coverage."
    },
    {
      "at": "Excluded perils",
      "say": "So what's excluded from the standard homeowners policy? Six to remember: floods, earthquakes, war or nuclear hazard, power failure, neglect, and intentional loss. The two big catastrophes the exam cares about most are flood and earthquake — those are the ones that come up in scenarios. And the key point: each one needs its own separate coverage. Flood requires a separate policy, and earthquake requires its own separate policy or endorsement. So if a client lives on a coastline or a fault line and only has a standard HO policy, they've got a gap — the answer is a separate flood or earthquake policy, not the homeowners form."
    },
    {
      "at": "HO forms coverage matrix",
      "say": "Here it is — the most tested table in the module. Let me walk you down the forms. HO-2 is the broad form: broad coverage across the board, with loss of use at twenty percent of Coverage A. HO-3 is the special form — this is the common one — open peril on the dwelling and other structures, but only broad on personal property, loss of use again twenty percent of A. HO-4 is the renters policy: no dwelling coverage, just broad personal property, loss of use twenty percent of C. HO-5 is comprehensive — open peril on everything, including personal property, and loss of use jumps to thirty percent of A. HO-6 is the condo form: minimal dwelling, broad personal property, loss of use forty percent of C. And HO-8 is the modified or historic form — basic coverage valued at actual cash value, loss of use ten percent of A. Now the trap the deck flags: watch the loss-of-use base. HO-2, 3, 5, and 8 base Coverage D on Coverage A — that's twenty, twenty, thirty, and ten percent. But HO-4 renters and HO-6 condo base it on Coverage C — twenty percent and forty percent. Mix up the base and you'll pick the wrong number."
    },
    {
      "at": "Which form is highest",
      "say": "So which form is the highest? HO-5 sits at the top of the ladder — it provides open-peril coverage on BOTH the buildings and personal property. That's the tell. HO-3 gives you open peril on the buildings but only broad on personal property, and that's the gap the HO-15 rider fills — bolt the HO-15 onto an HO-3 and you upgrade personal property to open peril too. Picture the ladder from the deck: HO-8 basic at the bottom, then HO-2, 4, and 6 at broad, then HO-3 with open buildings but broad contents, and HO-5 alone at the very top with open peril on everything. When the exam asks which form is highest or broadest, the answer is HO-5."
    },
    {
      "at": "Other personal property insurance",
      "say": "Now, for items the homeowners policy excludes or limits, you go outside the HO form. The big one is inland marine, also called a personal property floater — that gives open-peril-level coverage for high-value articles like jewelry, furs, silverware, and art. Here's why you need it: the homeowners policy caps how much it pays on categories like jewelry and silverware, so a stolen five-thousand-dollar ring might only recover a fraction of its value under the base policy. A floater schedules those specific items for open-peril coverage at full value. And then the two catastrophes again — flood insurance is a separate policy because flood is excluded, and earthquake insurance is a separate policy or endorsement because earthquake is excluded. So the theme of this slide: when the standard HO policy caps or excludes something, you buy a floater or a separate policy."
    },
    {
      "at": "Businessowners Policy",
      "say": "Quick one to round out the objective — the Businessowners Policy, or BOP. Think of it as the commercial cousin of the homeowners policy. It's a package policy that bundles property and liability coverage together in one contract for small-to-medium businesses. The analogy the deck draws is clean: just like an HO policy packages Section One property and Section Two liability for a home, the BOP packages property and liability for a business. So if you can remember the two-section homeowners structure, the BOP is the same idea applied to a small business."
    },
    {
      "at": "Coverage amounts & costs — coinsurance",
      "say": "Okay, objective two — coverage amounts and costs, and this is really about coinsurance. This is where the math lives, and the exam builds calculation questions right out of it. We'll get the formula, then work two examples step by step. Know this cold, because coinsurance shows up on almost every property section of the exam."
    },
    {
      "at": "coinsurance penalty formula",
      "say": "Here's the idea behind coinsurance. To recover in full on a partial loss, the owner has to carry insurance equal to at least the coinsurance requirement — and that's usually eighty percent of replacement cost. Carry less than that, and your recovery gets reduced by a shortfall ratio. The formula is: recovery equals insurance carried divided by insurance required, times the loss, minus the deductible. The required insurance is replacement cost times the coinsurance percentage, usually eighty percent. Two things to lock in. First, this is primarily a concern on a PARTIAL loss — a total loss is a different animal. Second, that ratio caps at one. You get no bonus for over-insuring, so if you carry more than required, the ratio is just one, not more. Now let's put real numbers to it."
    },
    {
      "at": "Worked example 1",
      "say": "Worked example one — the four-hundred-thousand-dollar home. Replacement cost is four hundred thousand, the coinsurance requirement is eighty percent, the owner carries three hundred thousand, there's a fifteen-hundred-dollar deductible, and the loss is one hundred thousand. Four steps, following the deck exactly. Step one: required insurance equals replacement cost times eighty percent — four hundred thousand times point eight is three hundred twenty thousand. Step two: the shortfall ratio is carried divided by required — three hundred thousand over three hundred twenty thousand equals point nine three seven five. Step three: apply that ratio to the loss — point nine three seven five times one hundred thousand is ninety-three thousand seven hundred fifty. Step four: subtract the deductible — ninety-three thousand seven hundred fifty minus fifteen hundred is ninety-two thousand two hundred fifty. So the insurer pays ninety-two thousand two hundred fifty dollars. Notice the order every time: required, ratio, apply to loss, then deductible."
    },
    {
      "at": "Worked example 2",
      "say": "Worked example two — Teresa's residence, and this one hides the trap. She insured it ten years ago for three hundred thousand, replacement-value policy, thousand-dollar deductible. Today the market value is five hundred fifty thousand, but replacement cost is five hundred thousand. Damage is one hundred thousand. Here's the trap up front: coinsurance is figured on REPLACEMENT COST, five hundred thousand, not market value, five hundred fifty thousand. Use the market value and you'll get the wrong required amount. Now the steps. Step one: required insurance is eighty percent of replacement cost — point eight times five hundred thousand is four hundred thousand. Step two: shortfall ratio is carried over required — three hundred thousand over four hundred thousand is point seven five, seventy-five percent. Step three: apply the ratio, then the deductible — seventy-five percent of one hundred thousand is seventy-five thousand, minus the thousand-dollar deductible is seventy-four thousand. So the insurer pays seventy-four thousand dollars, which is answer C. The whole question turns on picking replacement cost over market value."
    },
    {
      "at": "Replacement cost vs. actual cash value",
      "say": "Let's nail down the two valuation methods, because they change your numbers. Replacement cost pays to rebuild or replace with like kind and quality, with NO deduction for depreciation. Actual cash value, ACV, is replacement cost MINUS depreciation — and that's the valuation basis for the HO-8, the modified or historic form. So the tell: if a form or a question says ACV, you're subtracting depreciation; replacement cost, you're not. And then the factors that affect what homeowners coverage costs: construction of the home, location, the deductible you choose, and the policy type or form. Higher deductible, lower premium; riskier construction or location, higher premium. Simple, but they can ask it."
    },
    {
      "at": "Personal liability & umbrella coverage",
      "say": "Now objective three — personal liability and umbrella coverage. This is Section Two of the homeowners policy plus the excess layer that sits on top of everything. The exam really likes the distinction between liability coverage and medical payments, and it likes the sequencing rule on umbrellas, so keep both of those in your sights."
    },
    {
      "at": "Section II — liability coverages",
      "say": "Section Two, the liability coverages. Coverage E is personal liability — that's non-business, non-automobile personal liability, and it also wraps in medical payments to others, claim and first-aid expense, damage to property of others, and loss-assessment coverage. Coverage F is medical payments to others, a separate additional coverage. Here's the key distinction the exam tests: med pay is NOT liability. Medical payments pays for bodily injuries to others regardless of fault, typically up to a thousand dollars per person, and it does not require any negligence on the insured's part. Think of the dog-bite scenario — Jackson's dog bites a pedestrian. Coverage E, personal liability, responds if Jackson is found legally liable, up to his policy limits. Coverage F, med pay, can pay the injured person's medical bills regardless of fault, no need to prove Jackson did anything wrong. And both apply on OR off the insured property. So when a scenario has an injured third party, ask two questions: is there legal liability, which triggers E, and are there medical bills to cover regardless of fault, which triggers F."
    },
    {
      "at": "Umbrella (excess) liability",
      "say": "Umbrella coverage — this is excess liability, and three ideas define it. First, it sits on top: the umbrella takes over AFTER the underlying base coverage, your auto and homeowners, is exhausted. Second, it requires a base — you have to maintain the required underlying limits on auto, home, boat, and so on first. Third, it's catastrophic and cheap — a relatively low premium buys a large amount of catastrophic liability protection, which is why planners love it. Now the exam trap, and it's a sequencing rule: you must raise the underlying base auto and home limits up to the umbrella's required floor BEFORE the umbrella will pay. You cannot skip straight to an umbrella while sitting on thin base limits. So if a client wants umbrella protection, the first move is often to bump the base auto and home limits up to whatever the umbrella carrier requires. Sequence matters."
    },
    {
      "at": "The Personal Auto Policy",
      "say": "Last objective — the Personal Auto Policy, the PAP. This is the auto side of the module, and it maps onto the same lettered structure you already learned for homeowners. We'll cover who and what is insured, the six parts A through F, how to read a split limit, and the Part D collision and comprehensive detail. The Parts A through F structure is prime exam material, so let's get it clean."
    },
    {
      "at": "Who & what is covered",
      "say": "Start with who and what is covered. Who is an insured under the PAP? The named insured, the spouse, and resident relatives; anyone allowed to drive the covered auto; and a person or organization legally responsible for an insured's use of a covered auto. So it's broader than just the person named on the policy. And what's a covered auto? Any vehicle listed in the declarations; a newly acquired vehicle that meets PAP eligibility; a utility-type trailer owned by the insured — but note that excludes mobile homes and large trailers; and a substitute for a covered vehicle, like a rental while yours is in the shop. The tested edge cases are usually the newly acquired vehicle and the trailer exclusion, so keep those in mind."
    },
    {
      "at": "PAP structure — Parts A through F",
      "say": "The six parts of the Personal Auto Policy — memorize these letters. Part A is liability, and it's the biggest risk — bodily injury and property damage you cause to others. Part B is medical payments — medical costs for covered persons after an accident, funeral expenses, and it covers a pedestrian or cyclist struck by a licensed vehicle. Part C is uninsured and underinsured motorist — this protects the insured when the at-fault driver has no insurance, too little insurance, or in a hit-and-run. Part D is damage to your auto — that's collision, whether you're at fault or not, plus comprehensive, or other-than-collision, for things like fire, wind, hail, vandalism, and theft. Then the last two are administrative. Part E is duties after a loss — the insured's obligations after an accident, like prompt notice, cooperation, and proof of loss. And Part F is general provisions — bankruptcy, policy changes, fraud, subrogation, policy period and territory, termination. Here's the memory hook: E is duties after loss, F is general provisions. Parts A through D are the actual coverages; E and F are the rules of the road, the administrative stuff. The exam loves to swap E and F, so drill that."
    },
    {
      "at": "Split-limit auto liability",
      "say": "Now, how to read a split limit. Part A liability limits are usually quoted as three numbers. Take twenty-five fifty ten, written twenty-five slash fifty slash ten. The first number, twenty-five thousand, is bodily injury per person — the most paid for any one injured person. The second, fifty thousand, is bodily injury per accident — the total for all injured people in one accident. The third, ten thousand, is property damage per accident. So person, accident, property — always in that order. State minimums can be as low as twenty forty ten or twenty-five fifty fifteen, which are genuinely thin. And a single-limit policy is different — it states one combined dollar cap for all liability in an accident instead of splitting it three ways. The planning trap: state minimums rarely protect real assets. If a client has assets to protect, raise the base limits — the deck uses two-fifty five hundred one hundred as an example — BEFORE adding an umbrella, because you can't buy umbrella coverage sitting on state-minimum limits. Same sequencing rule as the homeowners umbrella."
    },
    {
      "at": "Part D detail & auto endorsements",
      "say": "Finally, the Part D detail and endorsements. Part D breaks into two pieces. Collision pays for damage to the covered auto whether or not the insured is at fault — the classic example is backing into a fence post, clearly your fault, still covered. Comprehensive, which is formally called other-than-collision, covers the non-collision causes — fire, wind, hail, vandalism, and theft. The way to keep them straight: if you hit something or something hits your car, that's collision; if it's fire, weather, vandalism, or theft, that's comprehensive. And then endorsements let you customize the auto policy — extended liability, named non-owner coverage, miscellaneous vehicles, motor homes, snowmobiles, and antique or classic autos. So when a scenario has an unusual vehicle or a driver without their own car, the answer is usually the matching endorsement. That's Module 2 end to end: the homeowners forms and that HO matrix, coinsurance math, liability versus med pay, umbrella sequencing, and the PAP Parts A through F. Nice work."
    }
  ];

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

  window.DECK_TEACH["fp512-m4-kaplan-slides.html"] = [
    {
      "at": "three annuity types",
      "say": "Alright, welcome to Module 4, Annuities. This first objective is your foundation: the three product types, the riders bolted onto them, and the vocabulary Kaplan uses to classify every annuity. Get the three flavors and where each one puts the investment risk locked in here, and the rest of the module falls into place. Let's build it up piece by piece."
    },
    {
      "at": "Three main types of annuities",
      "say": "Every annuity you'll see is one of three flavors, and the label just tells you how the cash value grows. Fixed pays a guaranteed, stated rate of interest, so the insurer bears the investment risk. Variable puts the cash value into subaccounts, so now the owner bears the market risk. Indexed sits in between: a fixed-value safety net plus growth tied to an index through a participation rate, caps, and floors. Now here's the single most testable idea in the whole module. Of everything an annuity offers, the preeminent feature is longevity-risk protection, guaranteed lifetime income, just like Social Security. Not creditor protection, not a guaranteed death benefit. When the exam asks for the standout benefit of an annuity, the answer is longevity protection."
    },
    {
      "at": "Chief benefits of annuities",
      "say": "So why would a client buy one? Four benefits. First, tax-deferred growth during the accumulation stage. Second, and this is the one they test, no contribution limits and no income phase-outs, unlike 401(k)s, IRAs, and Roth accounts, so a high earner can defer as much as they want. Third, protection against longevity risk, the risk of outliving your savings. And fourth, some of the unique investment strategies can shield you from bear markets. But here's the trap. Annuity gains come out as ordinary income. There is no long-term capital-gain treatment, ever. Because of that, the highest-bracket clients benefit most from the deferral, comparing a nonqualified annuity against an ordinary taxable brokerage account."
    },
    {
      "at": "six key annuity questions",
      "say": "Kaplan frames every annuity classification as the answers to six questions, and it's worth carrying them as a mental checklist. One, how are the premiums paid? Two, when do the benefits begin? Three, who is the annuitant? Four, what is the accumulation structure? Five, what is the method of benefit payment? And six, how long are the benefits paid? Notice that none of these ask about fixed versus variable growth directly, because that's a separate axis. These six are the who, when, and how-long of the contract. Answer all six and you've fully described any annuity on the test."
    },
    {
      "at": "Classifications of annuities",
      "say": "Now those six questions turn into a set of paired contrasts. Premium payment: single premium versus fixed or flexible premium. When benefits begin: immediate versus deferred. Whose life it covers: an individual life versus joint and last survivor. Payout duration: straight or pure life versus period certain or refund. And payout structure: fixed-dollar versus variable. Here's the wording trap to watch. Fixed and variable refer only to the underlying investments, nothing else. And every deferred annuity begins paying at some point in the future. Only an immediate annuity pays shortly after purchase. So if a question mixes immediate and deferred language, remember that deferred means the payout is down the road."
    },
    {
      "at": "Accumulation phase vs",
      "say": "An annuity really has two lives, and keeping them straight matters. In the accumulation phase, money goes in and grows tax-deferred. Then at annuitization the contract flips over into the payout phase and converts that pile into a stream of income, which can last for the rest of the annuitant's life. Picture a growth curve rising during accumulation, then a marker at annuitization, then a row of income payments marching out to the right, for life. The reason this two-phase picture matters is taxation: how the money is taxed depends entirely on which phase you're pulling from, and we'll come back to that."
    },
    {
      "at": "Annuity investment options",
      "say": "Now the riders, and this is where the variable family earns its keep on the exam. Fixed grows at a guaranteed stated rate, predictable, with the insurer bearing the risk. Equity-indexed uses a fixed-value safety net plus index-linked upside, governed by a participation rate, a cap, and a floor of zero percent. But it's the variable annuity that carries the guarantee riders they love to test, and they all start with G-M or G-L. GMIB is the guaranteed minimum income benefit. GMWB is the guaranteed minimum withdrawal benefit. GMAB is the guaranteed minimum accumulation benefit. And GLWB is the guaranteed lifetime withdrawal benefit. The tell for these is the third letter: income, withdrawal, accumulation, or lifetime. Match that middle word to what the rider guarantees and you'll pick the right one every time."
    },
    {
      "at": "Qualified Longevity Annuity Contracts",
      "say": "A QLAC is a deferred annuity funded with money from a qualified account, an IRA or a 401(k), and its whole job is to hand you guaranteed income later in life to manage longevity risk. Three numbers to know cold. The maximum you can put in is two hundred ten thousand dollars for 2025, and that figure is indexed. It lets you defer required minimum distributions all the way to age 85, versus the normal age 73. And there's a 90-day free-look period. It also clarified spousal survivor rights, and married couples can continue joint lifetimes even after a divorce. Now the trap. QLACs do have contribution limits, that two hundred ten thousand cap, and they intentionally delay income to a later age, like 80 to 85. They are not a liquidity source, and they do not promise higher returns. That delay is the entire design, hedging longevity risk. So if a client like Maria wants a QLAC, the right move is to evaluate the contribution limit and the payout timing, not to count on early liquidity or higher returns."
    },
    {
      "at": "Distribution options & taxation",
      "say": "Objective two is about getting money out: the payout options on one side, and how each distribution is taxed on the other. This is where the points live, so slow down with me. We'll cover the annuitization choices, the indexed products, and then the taxation map, exclusion ratio, and inherited-annuity rules."
    },
    {
      "at": "Annuitization (payout) options",
      "say": "When the contract annuitizes, you choose how long, and to whom, the income gets paid. Straight life income gives the largest payment because it stops at the annuitant's death, with nothing left to heirs. Life with period certain still pays for life, but it guarantees a minimum number of years to a beneficiary if the annuitant dies early. Life with refund pays for life and refunds any unrecovered premium. And joint and last survivor pays until the second of two lives dies. The key trade-off to understand is that straight life pays the most precisely because it protects the insurer against a long life but gives up any death benefit. The more protection you add for heirs, the smaller each payment gets."
    },
    {
      "at": "Equity-Indexed Annuities",
      "say": "An equity-indexed annuity, an EIA, is technically a fixed annuity, but it runs two cash-value accounts: a guaranteed interest account and a variable indexed account. You get market-linked growth with principal protection, plus a guaranteed minimum interest rate even when markets go negative. The upside is tied to an external index like the S&P 500, but it's limited by caps, spreads, and participation rates, and it uses interest-crediting methods similar to equity-indexed universal life. Get these three mechanics straight. The participation rate is the share of the index gain you actually get credited. The cap is the ceiling on how much gain can be credited. And the floor is zero percent in a down market, which is what protects your principal. Participation and cap limit your upside; the floor guards your downside."
    },
    {
      "at": "Registered Index-Linked Annuities",
      "say": "A RILA looks a lot like an EIA. It has a variable indexed account, similar crediting, caps, and participation. But here's the crucial difference: a RILA has no guaranteed minimum interest account. Instead of that safety net, it gives you either a buffer or a floor, and you must tell them apart. A buffer absorbs the first slice of loss, and you take anything beyond it. So with a ten percent buffer and a twelve percent market drop, the buffer eats the first ten percent and you're left with a two percent loss. A floor works the opposite way: it caps your maximum loss and the insurer absorbs anything worse. So with a ten percent floor and a twenty percent market drop, you lose no more than ten percent. The tell: a buffer protects the first X percent, a floor caps your worst-case at X percent. And higher buffers mean more protection but usually lower upside."
    },
    {
      "at": "RILA vs. EIA",
      "say": "Let's put RILA and EIA head to head, because the exam contrasts them. On risk, a RILA is subject to market risk and can actually lose value, while an EIA gives you a guaranteed return, normally zero to three percent, and avoids investing directly in equities by using index call options. On regulation, this is a clean tell: a RILA is regulated by the SEC, an EIA by the state insurance commissioner. On upside, the RILA offers higher market participation, while the EIA's upside is limited by its caps. So the one-line summary is this. RILAs give you the potential for higher gains but with some real risk exposure. EIAs are the more conservative choice, with guaranteed loss protection but a capped upside. More risk and more reward with the RILA; more safety and less reward with the EIA."
    },
    {
      "at": "Annuity income taxation",
      "say": "Now taxation, and there are just two ways money comes out. First, a nonperiodic distribution, a lump sum or partial withdrawal, is taxed LIFO, last in first out. Earnings come out first and are fully taxable, so you're taxed until you've worked your way back down to your basis. Second, an annuitized payment, whether fixed or variable, gets split. Part of each payment is a tax-free return of your basis, and part is taxable earnings, and the exclusion ratio decides the split. So the exam trap is the LIFO piece. A lump-sum withdrawal from a nonqualified annuity is gains-first, fully taxable until basis is left. Annuitizing is the friendlier route because it spreads your basis evenly across every payment instead of stacking all the tax up front."
    },
    {
      "at": "The exclusion ratio",
      "say": "Let's actually work the exclusion ratio, because they build questions around it. The formula is investment in the contract divided by expected return. Take Jimmy. Step one, the numerator is his basis, his investment in the contract, four hundred thousand dollars. Step two, the denominator is his expected return, which is the payment times the number of payments over his life expectancy: 25 years times 12 months times two thousand dollars, which is six hundred thousand. Step three, the exclusion ratio is four hundred thousand divided by six hundred thousand, which is zero-point-six-six-six-seven. Step four, apply that to his annual payments. His annual income is 12 times two thousand, so twenty-four thousand. Zero-point-six-six-six-seven of twenty-four thousand is sixteen thousand excluded. So sixteen thousand comes out tax-free, and the taxable ordinary income is twenty-four thousand minus sixteen thousand, or eight thousand a year. Two watch-outs. Once he outlives his life expectancy and has fully recovered his basis, every later payment becomes fully taxable. And if he dies before recovering his basis, the unrecovered amount is deductible."
    },
    {
      "at": "Inherited annuities",
      "say": "Inherited annuities carry a nasty surprise, so flag this one. An inherited annuity that hasn't been annuitized yet gets no step-up in basis at death. Compare that to appreciated stock, which does step up. With the annuity, that built-in gain stays fully taxable to the beneficiary. A spouse who is the sole beneficiary can do a spousal continuation and keep the contract going. A non-spouse beneficiary, though, is subject to the 10-year rule. You can sometimes soften the tax hit by annuitizing or through a section 1035 exchange. And a Roth annuity, funded with a Roth IRA, can grow tax-free, though those are less common than traditional. But the headline for the exam is that no-step-up rule: unlike appreciated stock, an inherited nonqualified annuity gives the heir no basis step-up, and non-spouse heirs face the 10-year rule."
    },
    {
      "at": "Suitability, risks & regulation",
      "say": "Last objective: is this annuity actually right for the client, and who's watching to make sure? We'll cover the suitability standard, the quiet risks clients overlook, the liquidity picture, and the regulatory framework. This is where you put on the advisor hat."
    },
    {
      "at": "The suitability standard",
      "say": "Annuities pay high commissions, and that creates strong incentives and real conflicts of interest, which, combined with poor disclosures and a history of violations, means recommendations have to be handled carefully. Suitability means aligning the annuity with the client's goals and risk tolerance. Per FINRA, suitability is about whether a product or transaction is appropriate for that individual's specific financial goals, risk tolerance, and overall situation. And here's an important nuance: a signed disclosure form helps, but by itself it does not guarantee protection, for instance in arbitration. One more detail under FINRA Rule 2111: cost must be considered, but the rule does not require you to recommend the lowest-cost option. Considered, not automatically chosen."
    },
    {
      "at": "subtle risks clients miss",
      "say": "Guarantees make annuities feel safer than the stock market, and that's partly true, but they carry four quieter risks. Inflation risk: fixed payments lose purchasing power over the years. Opportunity cost: dollars locked in an annuity can't chase higher returns somewhere else. Insolvency risk: the guarantee is only as strong as the insurance company behind it. And mortality risk: dying early can forfeit unrecovered value, depending on the payout option you chose. Here's a longevity example that shows the upside. Peter and Mary Jane, with a two hundred twenty-five thousand dollar nest egg, chose a straight-life joint-and-survivor immediate annuity with a 3 percent COLA rider paying twelve hundred a month, instead of drawing seventeen eighty-seven a month, which would have run dry in 19 years. Both lived to 96, and thanks to the COLA their payment had grown to twenty-nine hundred nine a month, and it keeps going indefinitely. That's longevity protection doing exactly its job."
    },
    {
      "at": "Liquidity & time horizon",
      "say": "Annuities are long-term products, and their liquidity reflects that. Liquidity is limited by surrender charges and tax rules, though there are some exceptions like free withdrawals and health-related waivers. C-share annuities allow fee-free withdrawals but charge higher ongoing costs for that flexibility. And annuitization is irreversible, which is an opportunity-cost risk, though it does discourage impulsive spending. These are long-horizon vehicles: the benefits grow over time and are built around life expectancy, and optional features like COLA riders add more value the longer you hold them. Three numbers to anchor. The typical surrender-charge period runs five to ten years. Early-withdrawal surrender charges range from ten to twenty-five percent. And the IRS ten percent penalty applies to withdrawals before age fifty-nine and a half, exactly like other retirement vehicles."
    },
    {
      "at": "Regulatory standards",
      "say": "Finally, who governs annuity recommendations. Regulation Best Interest, Reg BI, applies to variable annuity transactions by broker-dealers, holding them to a best-interest standard, but, and this is the trap, it does not apply to fixed annuities. The CFP Code of Ethics holds practitioners to a fiduciary standard: loyalty, conflict disclosure, informed consent, and competence. And the SEC and FINRA enforce through fines, real ones, like twenty-five million from FINRA in 2022, fifty million from the SEC in 2022, and ninety-seven million from the SEC in 2024. So lock in the exam trap: Reg BI does not cover fixed annuities. It only reaches variable annuities sold by broker-dealers. Fixed annuities are regulated at the state insurance level. That's Module 4 end to end: the three types and where risk sits, the classification vocabulary and QLACs, the payout options, EIAs and RILAs, LIFO and the exclusion ratio, and finally suitability and who's watching. Nice work."
    }
  ];

  window.DECK_TEACH["fp512-m5-kaplan-slides.html"] = [
    {
      "at": "Regulation & features of individual health plans",
      "say": "Alright, welcome to Module 5 — health insurance and the government programs. This first objective is about how individual health plans are regulated and the life events that change coverage. Keep the federal laws straight from the programs, and know the metal tiers, and this section is yours."
    },
    {
      "at": "Transitions & the planner's role",
      "say": "Okay, health-coverage needs shift at predictable triggering events, and spotting them is the planner's job. Group them three ways. Life events like marriage, divorce, birth, death, and disability. Work events like losing or changing jobs, dropping to part-time, or a big income change. And other events like moving or retiring. Then memorize four ages. You get thirty days to add a newborn to coverage. A child can stay on a parent's plan to age twenty-six. Age fifty-five is retiree and early-transition planning. And age sixty-five is when Medicare eligibility begins. Here's the exam trap on that age-twenty-six rule — the child can stay on the plan whether or not they're claimed as a tax dependent. Dependency for income-tax purposes is not required, so if an answer choice adds that condition, it's wrong."
    },
    {
      "at": "HIPAA — portability that fights",
      "say": "Now HIPAA — the Health Insurance Portability and Accountability Act of 1996. Its whole job here is to fight job lock, the situation where a worker is trapped in a job just to keep their health coverage. HIPAA sets major health-insurance provisions designed to reduce that trap. The tell for the exam: HIPAA is a federal law, not a program. It improves the portability of coverage and limits how pre-existing conditions can restrict people who change jobs or plans. Contrast that with a program like Medicare, which we'll get to — laws set the rules, programs deliver the benefits. So keep HIPAA firmly in the law column."
    },
    {
      "at": "COBRA — continuation coverage",
      "say": "COBRA — the Consolidated Omnibus Budget Reconciliation Act — lets qualified beneficiaries keep their group coverage after a qualifying event. Two numbers first. The election window is sixty days from notice to enroll. And the maximum continuation period depends entirely on the event. Here's the memory hook. Eighteen months is for job-status loss — voluntary or involuntary termination, or dropping from full-time to part-time. Twenty-nine months is for disability under the Social Security definition. And thirty-six months is for the family-side events: the employee's death, divorce, legal separation, the employee becoming eligible for Medicare, and a child losing dependent status — all thirty-six. So think eighteen equals job loss, twenty-nine equals disability, thirty-six equals family events. The exam loves to swap those durations around, so lock the pattern in."
    },
    {
      "at": "PPACA — the Affordable Care Act",
      "say": "PPACA — the Patient Protection and Affordable Care Act. It expands coverage, affects affordability, and sets standards for comprehensive health plans, working through two mandates: an individual mandate with standards for individuals obtaining coverage, and an employer mandate with standards for employers offering it. And it applies only to comprehensive health care plans. Now the exam trap, and it's a good one. PPACA eliminated maximum policy limits — the lifetime and annual dollar caps on comprehensive major-medical plans. What it did not eliminate: copayments, coinsurance splits, and deductibles. HSAs still require high-deductible plans, so deductibles are very much alive. If a question asks what PPACA removed, the answer is maximum policy limits, not copays or deductibles."
    },
    {
      "at": "ACA Marketplace — the metal tiers",
      "say": "The ACA Marketplace, or exchange, groups plans into metal tiers by how much of your covered costs the plan pays. The rule to internalize: higher metal means a higher premium but lower out-of-pocket cost. Order them from lowest coverage to highest — Catastrophic, then Bronze, Silver, Gold, and Platinum. Catastrophic has the lowest premium but the highest out-of-pocket, and it's only available to limited groups. Platinum flips that — highest premium, lowest out-of-pocket. So as coverage rises, premium rises with it and your out-of-pocket spending falls. Just chant the sequence: Catastrophic, Bronze, Silver, Gold, Platinum. If you know the order, you can answer any relative premium or out-of-pocket question they throw at you."
    },
    {
      "at": "Medicaid & CHIP",
      "say": "Now a quick but heavily tested pair — Medicaid and CHIP. The exam wants you to place these correctly against the federal laws and programs you just learned, so watch closely for who initiates them and who actually runs them."
    },
    {
      "at": "coverage for eligible persons",
      "say": "Okay, Medicaid is for people who are unable to afford health care. The key structural fact: it's federally initiated, but administered and partially funded at the state level, and each state sets its own qualification criteria. CHIP is the Children's Health Insurance Program — a federal program administered by the states, built for children in families who earn too much to qualify for Medicaid but still need coverage. Here's the contrast that ties the whole section together. HIPAA and COBRA are federal laws. Medicare is a federal program, mainly for people age sixty-five and up. And Medicaid is federally initiated but state-administered welfare. So when the exam asks which one is a federal program administered by the states, Medicaid is your answer — not HIPAA, not COBRA, not Medicare."
    },
    {
      "at": "Types of health plans & managed care",
      "say": "This section is the managed-care block, and it opens with a classic tested contrast. We'll compare traditional indemnity insurance against managed care, then break down the four managed-care plan types, the cost vocabulary, and telemedicine."
    },
    {
      "at": "Traditional health insurance vs. managed care",
      "say": "Alright, the classic contrast. Traditional indemnity insurance maximizes flexibility; managed care trades some of that flexibility for lower, coordinated cost. Walk the differences. With traditional, the insurance company reimburses; with managed care, the care providers deliver and coordinate the care. Traditional uses a deductible; managed care uses copayments. Traditional gives you a wider selection of physicians and needs no primary-care doctor or referral; managed care limits your selection and usually requires a PCP referral. Traditional is curative in orientation with some prevention now; managed care is preventive by design. Traditional bills based on service with few geographic restrictions; managed care uses pre-established fees and is often geographically limited. And the traditional plan forms to know are fee-for-service, major medical, and comprehensive major medical."
    },
    {
      "at": "The managed-care plan types",
      "say": "Now the four managed-care structures, and the exam tests two things about each — how freely you can use out-of-network providers, and whether you need a referral. HMO, the health maintenance organization: generally no out-of-network coverage, and yes, a PCP referral is required — it's the most restrictive but the lowest cost. PPO, the preferred provider organization: out-of-network is allowed at higher cost, and no referral is needed — it's the most flexible. EPO, the exclusive provider organization: in-network only, but usually no referral and no PCP gate. POS, point of service: out-of-network allowed at higher cost, but a referral is required — it's the HMO-PPO hybrid. Underneath sits the payment concept: capitation, a fixed per-member payment to the provider, versus fee-for-service. And the trap — Medicaid is not managed care; it's welfare."
    },
    {
      "at": "Health-plan cost terminology",
      "say": "Quick vocabulary slide, but these terms drive the math coming up, so nail the definitions. Covered charges are the expenses the policy will actually consider. The deductible is what the insured pays before the plan pays anything. Copays are a flat per-visit or per-service charge. The coinsurance provision is the insured's percentage share of the bill — commonly twenty percent. And the maximum out-of-pocket limit, the MOOP, is the cap on the insured's total spending; once you hit it, the plan pays one hundred percent above that point. Keep that order in your head — deductible first, then coinsurance, then the MOOP cap — because that's exactly the sequence the calculation questions follow."
    },
    {
      "at": "Telemedicine & direct-to-consumer",
      "say": "Telemedicine delivers health care remotely through telecommunications. Demand grew dramatically after twenty-twenty, and most major medical plans now cover it — including Medicare and Medicaid, which is a detail the exam likes. Then there's the direct-to-consumer nuance. Standalone direct-to-consumer, or DTC, plans are technically not insurance, but they cover basic services at a discount. Because they're a discount arrangement rather than true coverage, they work best as a supplement — specifically, an ideal supplement to a high-deductible health plan, an HDHP. So if a question describes a cheap standalone plan that isn't really insurance but pairs nicely with an HDHP, that's DTC."
    },
    {
      "at": "Calculating the cost of health care",
      "say": "Now the math objective — calculating the cost of health care. There's really one mechanic here, the deductible, then coinsurance, then MOOP sequence, and once you can run it cleanly these questions are fast points."
    },
    {
      "at": "How MOOP math works",
      "say": "Here's the mechanic, and it's always the same three steps. The insured pays the deductible first. Then they pay a coinsurance percentage of the remaining covered charges. That continues until their total spending reaches the MOOP limit — and after that, the plan pays one hundred percent. That's it: deductible, then coinsurance, then the plan takes over at the MOOP. One bit of context — this is the same engine behind high-deductible health plans. An HDHP pairs a large deductible with an HSA, but the deductible, coinsurance, MOOP mechanics are identical. So learn it once and it works everywhere."
    },
    {
      "at": "Worked example — Kayla's reimbursement",
      "say": "Let's work Kayla's claim step by step. Her major-medical policy has a one-thousand-dollar deductible, twenty percent coinsurance, and a five-thousand-dollar MOOP. She has twenty-five thousand dollars of eligible expenses, her first claim of the year. Step one: she pays the one-thousand deductible. Step two: coinsurance runs until she hits the MOOP. She still owes five thousand minus one thousand, so four thousand of coinsurance — and at twenty percent, four thousand divided by twenty percent means twenty thousand dollars of charges get split eighty-twenty. Step three: her deductible plus that twenty thousand is twenty-one thousand of charges to reach the MOOP. Step four: everything above that, twenty-five thousand minus twenty-one thousand, is four thousand paid one hundred percent by the plan. Bottom line: Kayla pays five thousand — her MOOP — and the insurer pays twenty thousand."
    },
    {
      "at": "Medicare — the four parts",
      "say": "Now the big one — Medicare and its four parts. Know each part cold, because the exam constantly asks you to tell Part A from B from C from D, and it hides false statements about premiums inside the answer choices."
    },
    {
      "at": "Parts A, B, C & D at a glance",
      "say": "Let's take the four parts. Part A covers inpatient hospital expenses; it's premium-free if you have forty quarters of work, though it still has a deductible. Part B covers physician and outpatient expenses; it charges a monthly premium plus a deductible and coinsurance, and it carries a late-enrollment penalty. Part C is Medicare Advantage — private plans that bundle Parts A, B, and D together, often for less than buying A plus B plus D plus a supplement, sometimes with extra benefits. Part D is the prescription drug benefit; monthly premium, not needed if you already have Advantage, and a one-percent-per-month late-enrollment penalty. And here's the classic exam trap: the claim that most people pay a small Part A premium is false. With forty quarters of covered work, Part A is premium-free."
    },
    {
      "at": "Initial Enrollment Period — the 7-month window",
      "say": "The Initial Enrollment Period, the IEP, is a seven-month window built around your sixty-fifth birthday. It spans the three months before the month you turn sixty-five, the birth month itself, and the three months after — three plus one plus three equals seven. That's the whole trick: three before, birth month, three after. Miss that window and the consequences stack up — penalties, additional lifelong premiums, and potential pre-existing-condition issues. So the number to say out loud on exam day is seven months, and if a question describes exactly three months before, the birth month, and three months after age sixty-five, that's a true statement about Medicare enrollment."
    },
    {
      "at": "Part C — Medicare Advantage plan types",
      "say": "Part C, Medicare Advantage, is delivered through private plans that combine Parts A, B, and D, often adding benefits original Medicare doesn't have. Know the plan types they list. Medicare HMOs and PPOs, which are the managed-care Advantage plans. Private fee-for-service, or PFFS, which pays on a fee basis. Special needs plans, targeted to specific populations. And the Medicare MSA, a medical savings account Advantage plan. One practical limit to remember — Advantage programs are not always available in every geographic area, so availability depends on where the client lives. And the same enrollment warning applies: penalties and pre-existing-condition issues arise if you don't enroll at sixty-five or when your creditable coverage ends."
    },
    {
      "at": "Medicare supplement (Medigap) plans",
      "say": "Last section — Medicare supplement insurance, better known as Medigap. Just one slide, but there are a few memorize-cold rules the exam almost always tests, so let's hit them precisely."
    },
    {
      "at": "Medigap — filling Medicare's gaps",
      "say": "Medigap is Medicare supplement insurance, sold by private insurers as an alternative to Medicare Advantage. It comes in standardized plans, lettered A through N, each with a different benefit level. The basic benefits include reimbursement for some costs not covered by Medicare Part A, the insured's Part B coinsurance percentage, all hospital expenses for an additional three hundred sixty-five days, and three pints of blood. Now the two rules to memorize. First, a senior may hold only one Medigap policy under current law — just one. Second, insurers must accept all applicants within the first six months of Medicare qualification, regardless of pre-existing conditions — that's the guaranteed-issue window. And one more: Plan A provides the least coverage at the lowest cost. So the least expensive, least generous option is always Plan A."
    }
  ];

  window.DECK_TEACH["fp512-m6-kaplan-slides.html"] = [
    {
      "at": "Disability insurance — terms & riders",
      "say": "Alright — welcome to Module 6. We start with disability income insurance, and this first objective is all about the vocabulary and the moving parts. Get the terms right and the definitions right, because the exam builds most of its DI questions out of exactly these pieces. Let's walk them one at a time."
    },
    {
      "at": "What disability income (DI) insurance does",
      "say": "Okay, start with what disability income insurance is actually for. DI replaces a portion of the insured's earned income when they can't work because of illness or injury — it protects the client's single largest asset, their ability to earn. Now three timing terms you need cold. First, once benefits become payable, the insurer is given as much as thirty days to process the DI payments. Second, the elimination period — that's the waiting period from the onset of disability until benefits actually begin. Third, the benefit period — how long payments continue once they start, maybe five years, maybe to age sixty-five, maybe lifetime. And here's the planning logic: a longer elimination period lowers the premium, because the insured is self-insuring that early gap, while a longer benefit period raises the premium, because more risk is being transferred to the insurer."
    },
    {
      "at": "Definitions of disability — liberal to restrictive",
      "say": "Now the single most important term in any DI policy — how it defines disabled. This decides whether a claim even qualifies, so know this cold. Picture a ladder from most liberal down to most restrictive. At the top, own-occupation: you're disabled if you can't do your OWN occupation, even a specialty — a brain surgeon who can't operate is disabled even if she could do other work. That's easiest to claim and best for the insured. In the middle, modified any-occupation: you're disabled only if you can't do ANY occupation you're reasonably fitted for by education, training, and experience. At the bottom, any-occupation: disabled only if you can't do ANY occupation at all — the strictest, hardest to claim. Here's the tell the exam wants: any-occupation is the one that's most similar to the Social Security definition. Own-occ pays the most claims; any-occ mirrors Social Security."
    },
    {
      "at": "Loss-of-income (loss-of-time) definition",
      "say": "There's a fourth approach that works completely differently — the loss-of-income, or loss-of-time, definition. Instead of asking what job duties you can or can't perform, it ignores specific duties entirely and pays based on the income you actually lost. The benefit is figured as the percentage of income lost — it compares your post-disability income against your pre-disability income, and the dollar drop is what matters. So if you can still work part of your job but your earnings fall, this definition pays on that shortfall. The key contrast: the own-occ and any-occ definitions look at what you can DO; the loss-of-income definition looks at what you EARN."
    },
    {
      "at": "Policy renewal (continuation) provisions",
      "say": "This is a favorite exam ranking — the renewal, or continuation, provisions, from the strongest guarantee to the weakest. At the top, noncancellable, often shortened to noncan: the insurer can neither cancel the policy nor raise your premium — the rate is guaranteed too. That's the best for the insured. Next, guaranteed renewable: the insurer must renew, so it can't cancel, but it CAN raise your premium — by class, not against you individually. Below that, conditionally renewable: it can only be cancelled if a stated condition is met, and premiums can rise. Then nonguaranteed continuation: the insurer can cancel at its own discretion. And weakest of all, no stated provision — no renewal promise at all. So the two you'll get tested on most: noncancellable is strongest, guaranteed renewable must renew but may raise rates by class."
    },
    {
      "at": "Other disability policy provisions",
      "say": "A few more provisions that fill out a DI policy, and the exam likes to make you tell them apart. Residual disability pays a partial benefit that's proportional to the income you actually lost after you return to some work — it scales with your earnings drop. Partial disability instead pays a flat or partial benefit when you can work but not at full duties or full time. And presumptive disability is the special one: certain losses — sight, hearing, the loss of limbs — are PRESUMED to be total disability, so the policy pays full benefits without the usual proof-of-loss requirement. The tell there is the word presumed: those specific catastrophic losses skip the normal proof step and pay in full automatically."
    },
    {
      "at": "Business forms of DI insurance",
      "say": "Disability insurance also comes in business forms, and there are two to know. Business overhead expense, or BOE, reimburses the fixed overhead of a disabled owner's business — rent, utilities, staff salaries — so the practice can survive while the owner is out. Disability buyout is different: it funds a buy-sell agreement so a disabled owner's interest can actually be bought out by the co-owners. Now three facts about BOE the exam tests. Its benefit periods are short — generally limited to about twelve or twenty-four months, not years and years. It's most valuable to small, white-collar businesses with just a few owners. And it covers the overhead that keeps running whether or not the owner can work. So if a question describes covering office rent, utilities, and staff salaries for a small professional practice, that's BOE."
    },
    {
      "at": "Disability riders",
      "say": "Now the disability riders — the add-ons that customize the policy. Waiver of premium waives the premiums while the insured is disabled, so coverage stays in force without them paying. The guaranteed purchase option, or GPO, lets the insured buy additional coverage later without new medical underwriting — it protects future insurability. Cost-of-living, the COLA rider, increases the benefit during a claim to keep pace with inflation, so a long claim doesn't get eaten away. And the social insurance supplement, or SIS, pays a benefit that's offset and coordinated with Social Security disability payments — it fills the gap while a Social Security claim is pending, then adjusts once that kicks in. Recognize what each one solves for when a scenario describes the need."
    },
    {
      "at": "Selecting a disability plan · underwriting · taxation",
      "say": "Okay, second objective. Now that you know the terms, we shift to actually selecting a plan: sizing the exposure, how insurers underwrite disability risk, and — the big one — how the benefits are taxed. That taxation rule is one of the most tested items in the whole module, so we'll spend real time on it."
    },
    {
      "at": "Disability income exposures",
      "say": "Start by framing the exposure — what are we actually insuring against? First, personal loss of income, and that loss can be partial or full. Second, the time dimension: short-term exposure versus long-term exposure — a bad flu is very different from a permanent disability. And third, the one people forget — the retirement and Social Security impact. A long disability doesn't just stop your paycheck; it also halts your retirement saving and stops future Social Security benefits from accruing. So the true cost of a long disability is bigger than the missing income today — it quietly damages the client's retirement security too. Keep that third bullet in mind, because it's the one the exam uses to separate a shallow answer from a complete one."
    },
    {
      "at": "Underwriting — occupational classes",
      "say": "Here's how insurers underwrite disability risk. They group applicants into occupational classes by risk level. They put limits on income replacement — you can't insure one hundred percent of your income, and the reason is moral hazard: if you got paid the same disabled as working, you'd have no incentive to return to work. Both the benefit amount and the available term can vary by class. And they consider earned income, the taxation of that income, and any other income sources. Now the blue-collar versus white-collar point, because there's a trap inside it. Moving toward white-collar generally brings a more liberal definition — more own-occ policies — a longer benefit period, and more riders available. But benefits themselves track income; they don't fall as you move toward white-collar. So if a question says benefits become LOWER for white-collar, that's the false statement."
    },
    {
      "at": "Taxation of DI benefits — who paid the premium?",
      "say": "This is the one to know cold — the taxation of disability benefits turns entirely on who paid the premium, and with what dollars. Three cases. One: the employee, the individual, pays the premium with after-tax dollars — then the benefits are received tax-free. Two: the employer pays the premium with its own dollars — then the benefits ARE taxable to the employee. Three: the employee pays but with pretax dollars — again the benefits are taxable to the employee. Here's the one-line memory hook that ties it together: pay tax on the premium, and the benefits come out tax-free; skip tax on the premium, and the benefits get taxed. So employer-paid premiums, or employee premiums paid pretax, both produce taxable benefits. The IRS gets its cut exactly once — either on the way in, on the premium, or on the way out, on the benefit."
    },
    {
      "at": "The disability timeline",
      "say": "Let's put the timing terms on a single timeline so they lock together. It starts at the onset of disability. From there runs the elimination period — during that stretch no benefits are paid; the insured is effectively self-insuring. When the elimination period ends, benefits begin, and remember the insurer has up to thirty days to process that first payment. Then the benefit period runs, with payments continuing, until it ends — for example, at age sixty-five. So the sequence is: onset, then the unpaid elimination period, then benefits begin with up to thirty days to process, then the benefit period, then the end. If you can draw that line from memory, the elimination-period and benefit-period questions become easy."
    },
    {
      "at": "Worked example — Marcus's group DI benefit",
      "say": "Let's actually work a group DI problem, because the exam loves this exact multi-step setup. Marcus is single, supporting his widowed mother, and he needs four thousand dollars a month after tax. His group coverage pays sixty percent of base salary, and the premiums are paid by the employer. He earns one hundred thousand dollars, of which ten thousand is bonus, and his average tax rate is twenty percent. Three steps. Step one — strip the bonus, because the benefit is on base salary only: one hundred thousand minus the ten-thousand bonus is ninety thousand of base. Step two — apply the sixty percent group benefit to that base: sixty percent of ninety thousand is fifty-four thousand a year, or four thousand five hundred a month, pre-tax. Step three — tax it, because the employer paid the premium, so the benefit is taxable: four thousand five hundred times one minus point-two-zero gives thirty-six hundred a month after tax. So Marcus lives on about thirty-six hundred — below his four-thousand need. The two traps: forgetting to subtract the bonus, and forgetting to tax the employer-paid benefit."
    },
    {
      "at": "Long-term care — types, terms & riders",
      "say": "Now we switch to long-term care. This objective covers the types of care, the terms, and the riders. The two things the exam hammers here are the levels of care and the benefit trigger — the ADLs and the HIPAA rules — so keep those front of mind as we go through it."
    },
    {
      "at": "Levels of care",
      "say": "Long-term care comes in levels, running from most intensive, most medical, down to least, and the exam loves to make you rank them. At the top is skilled care — the highest level: a registered nurse available twenty-four hours, under a doctor's supervision. Below that, intermediate care — less intensive nursing or rehabilitative care. Then custodial care — nonmedical assistance with daily activities like bathing and eating; no physician oversight. Then home care — care in the patient's own home, and it's notable as the first level that is NOT institutional. And finally respite care — a temporary replacement caregiver so the primary caregiver gets a break. The most tested point: skilled care is the highest level, defined by that twenty-four-hour registered nurse under a doctor's supervision."
    },
    {
      "at": "Activities of Daily Living (ADLs) — the benefit trigger",
      "say": "Here's the benefit trigger for long-term care, and this is heavily tested. LTC benefits typically begin when the insured cannot perform a set number of Activities of Daily Living, the ADLs — or has a cognitive impairment. Memorize the six ADLs: bathing, dressing, toileting, transferring, eating, and continence. Cognitive impairment — severe cognitive loss such as dementia — is a separate, alternate trigger, independent of the ADLs; you don't need to fail ADLs if there's a qualifying cognitive loss. And the care has to be necessary for the health and maintenance of the individual. Now the magic number: losing the ability to do two of the six ADLs, or having a cognitive impairment, is what triggers a HIPAA-qualified LTC benefit. Two of six, or cognitive impairment — that's the phrase to have on instant recall."
    },
    {
      "at": "Important LTC policy provisions",
      "say": "These are the provisions to check on any LTC policy. The level of care required before benefit payments begin. The elimination period — the waiting period from eligibility until payments start. The benefit period and the benefit amounts, usually expressed as a daily benefit. Renewability and the time of underwriting, plus waiver of premium. Any preexisting-condition waiting period, and the nursing-facility and home-health qualification rules. And whether an inflation rider is available. Now two exam flags. First, avoid any policy with a prior-hospitalization requirement — where benefits only pay after a hospital stay. That's a red flag; those policies are to be avoided. Second, the numbers: daily benefit amounts range widely, from about fifty dollars up to five hundred dollars a day, but most fall between fifty and one hundred fifty."
    },
    {
      "at": "HIPAA-qualified LTC insurance",
      "say": "Now the tax-qualified version — a HIPAA-qualified LTC contract. This is a policy that meets federal standards, so its benefits get favorable tax treatment. Three requirements. The benefit trigger: unable to do two of the six ADLs for at least ninety days, OR cognitive impairment. It conforms to the NAIC LTCI model regulation, and it's guaranteed renewable. And it offers guaranteed nonforfeiture benefits. Now the taxation piece, because this is the payoff. Benefits from a HIPAA-qualified per-diem, or indemnity, policy are received income-tax-free up to the IRS daily limit. If the benefits exceed that daily limit, the excess is only tax-free to the extent of actual qualified long-term-care costs. So per-diem benefits are tax-free up to the IRS cap, and anything above the cap is tax-free only if you actually spent it on qualified LTC."
    },
    {
      "at": "Financing long-term care",
      "say": "Okay, this objective is about financing long-term care — how the client actually pays for it. The centerpiece is the difference between Medicare and Medicaid, because people constantly assume Medicare covers long-term care and it largely does not. We'll sort that out, then look at Partnership plans and how much coverage to buy."
    },
    {
      "at": "Medicare vs. Medicaid for LTC",
      "say": "Here's the distinction people get wrong constantly — Medicare versus Medicaid for long-term care. Medicare provides only LIMITED long-term care benefits. Its key requirement is that the care must be skilled AND the patient's condition must be expected to improve. So Medicare will NOT cover custodial-only care, and it won't cover care when the patient isn't expected to get better. Medicaid, on the other hand, is long-term care for the impoverished — it's the real LTC payer of last resort. To qualify, you have to meet strict income and asset limits, and those rules vary by state. Medicaid won't help someone whose assets are above the state limit until they've spent those assets down. The big trap: Medicare is not a long-term custodial-care program — if the patient's health is not expected to improve, Medicare will not cover the long-term care."
    },
    {
      "at": "Partnership plans & the financing options",
      "say": "Now the financing menu, and one feature the exam likes — Partnership plans. A state-approved Partnership plan lets the pool of LTC coverage you purchased be excluded from Medicaid spend-down requirements. In plain terms: you can protect assets equal to the benefits the policy paid out, and still qualify for Medicaid afterward — it's an incentive to buy LTC coverage instead of just spending down. Beyond that, the ways to finance long-term care are: self-pay, where you retain the risk and fund care from assets or a reverse mortgage; a traditional or joint standalone LTC policy, individual or shared; a life or annuity policy with an LTC rider — that's the combo or hybrid product with an acceleration rider; and finally spending down to Medicaid, depleting assets to qualify. Partnership plans are the one to remember because they let insurance and Medicaid work together."
    },
    {
      "at": "Factors influencing how much LTC to buy",
      "say": "How much LTC coverage should a client buy? Several factors go into it: the cost of long-term care in the client's area, and the individual's own goals; the financial security of a healthy spouse, and any family support available; the client's available assets weighed against Medicaid planning, and the premium cost; the daily benefit amount the policy offers, and the client's marital status. Now here's the classic trick question. Which of those is NOT a sizing factor? HIPAA qualification. HIPAA qualification affects a policy's TAX treatment — whether the benefits come out tax-free — not HOW MUCH coverage to buy. Don't confuse the two. If a question asks what determines the amount of coverage and lists HIPAA qualification, that's your exception — it drives taxation, not the amount."
    },
    {
      "at": "Veterans benefits (VA) health provisions",
      "say": "Last objective — Veterans benefits, the VA health provisions. This is more factual recall than calculation. Focus on what the Veterans Benefits Administration does and doesn't do, how coverage gets determined, the eligibility rules, and how VA coverage coordinates with other insurance. Let's go through it."
    },
    {
      "at": "The Veterans Benefits Administration (VBA)",
      "say": "Start with the agency itself. The Veterans Benefits Administration, the VBA, is an agency of the U.S. Department of Veterans Affairs. Its primary job is to administer benefit programs for veterans, their dependents, and their survivors. The major VA benefits include compensation and pensions, and survivor benefits; rehabilitation and employment services, plus education and career assistance; home loan guaranties, and life insurance; and medical benefits — health care, long-term care, vision, and dental. Now the exam trap, and it's a clean one: the VBA does NOT provide general financial and accounting assistance. That falls outside its benefit programs. So when a question lists services and one of them is financial and accounting assistance, that's the one the VBA does not provide."
    },
    {
      "at": "How VA coverage is determined",
      "say": "How does the VA decide what care a veteran gets? Coverage primarily relies on three things. First, the priority group the veteran is assigned to — and that assignment is based on the severity of need. Second, the advice of the veteran's VA primary care provider. And third, the medical standards for treating the veteran's current condition. So it's a combination of how urgent the need is, the treating provider's judgment, and accepted medical standards. One useful side note for the health-planning picture: VA health care is protected by the Affordable Care Act — it counts as qualifying minimum essential health coverage. So a veteran on VA care already satisfies that ACA coverage requirement."
    },
    {
      "at": "Where care is delivered",
      "say": "A quick orientation to the scale and the settings. The VA covers more than nine million veterans, through over twelve hundred VA locations nationwide. And normally a veteran's care is provided at one VA location of their choice — one home site, rather than scattered across facilities. The care settings themselves include VA Medical Centers; VA Community-Based Outpatient Clinics, the CBOCs; VA Centers; VA Community Living Centers and assisted living; and even the veteran's own home. So the system is large and spread out, but for any given veteran it centers on a single chosen location, with several types of setting available from a hospital down to in-home care."
    },
    {
      "at": "VA eligibility",
      "say": "Now the eligibility rules. The general requirements: the person must have had military, naval, or air service, and the discharge must NOT be dishonorable — a dishonorable discharge is disqualifying. And generally twenty-four months of continuous service, or the full period for which active duty was required. But those minimum-duty requirements are WAIVED in a few situations: if the person was discharged because of a disability that active-duty service caused or made worse; if they were discharged for an early out or a hardship; or if they served prior to September seventh, nineteen eighty. And note that current or former members of the Reserves or the National Guard may qualify too. So the two headline numbers to remember are twenty-four months of service and the not-dishonorable discharge, plus that September seventh, nineteen eighty date for the waiver."
    },
    {
      "at": "Coordination & cost",
      "say": "Finally, how VA coverage coordinates with everything else. VA health coverage can be used alongside other coverage — private insurance, Medicare, Medicaid, and TRICARE. What pays depends on the service connection. If the care is connected to prior or current active duty, VA benefits cover it. If it's NOT connected to active duty, then the other coverage responds — private insurance, Medicare, Medicaid, or TRICARE. A couple of planning points: veterans MAY drop their outside coverage, but doing so carries real risk, since the VA only covers service-connected care. And veterans can use an HSA or an HRA to pay for both VA and non-VA services. So the rule of thumb: service-connected goes to the VA, everything else goes to the other coverage, and keep that outside coverage rather than dropping it."
    }
  ];

  window.DECK_TEACH["fp512-m7-kaplan-slides.html"] = [
    {
      "at": "Group life insurance & its taxation",
      "say": "Alright, welcome to Module 7, Employee Group Benefits. We open with group life insurance and, more importantly, how it gets taxed. The star of this whole section is Section seventy-nine group term life. Keep two things front of mind as we go: what makes a plan qualify, and where the tax line falls. Nearly every exam question in here hangs off those two ideas."
    },
    {
      "at": "what makes a group life plan qualify",
      "say": "Okay, let's start with what makes a Section seventy-nine group term life plan actually qualify. There are three basic policy requirements. One, it must provide a general death benefit. Two, it must be provided to a group of employees, meaning all employees, or a class based on age, marital status, or work-related factors like duties, compensation, or length of service. And three, the coverage amount must be based on a uniform formula for everyone. Beyond that, the typical features are what make group life attractive: annual renewable term, the face amount paid to the beneficiary, coverage tied to compensation, position, service, or a flat amount, and it is low cost, tax-advantaged, simple to administer, requires no medical exam, and carries a premium waiver. Know those three requirements cold."
    },
    {
      "at": "four nondiscrimination",
      "say": "Now the nondiscrimination tests, and here is the single detail people miss. A plan must meet just one of four requirements to qualify, not all four. Requirement one, at least seventy percent of employees must benefit. Two, at least eighty-five percent of plan participants are not key employees. Three, the plan benefits a nondiscriminatory classification of employees. And four, it complies with Section one twenty-five requirements if it is part of a cafeteria plan. The tell on the exam is that word one. If an answer says the plan must satisfy all four, that is wrong. It only has to clear one of them. And of these, the seventy percent and eighty-five percent figures are the most-tested numbers, so lock those in."
    },
    {
      "at": "The $50,000 line",
      "say": "Here is the tax line that drives everything, so know this cold. Employer-provided group term life is tax-free to the employee up to fifty thousand dollars of coverage. The cost of coverage over fifty thousand dollars becomes taxable imputed income to the employee, and it is valued using the IRS Table one uniform-premium rates, not the employer's actual cost. On the deduction side, the employer deducts the premium at both layers, as long as it is not the beneficiary. So below fifty thousand, nothing hits the employee. Above fifty thousand, Table one cost gets added to the employee's W-2. A couple of exceptions to file away: the excess cost is not taxable if the beneficiary is a charity or the employer, or if the covered employee is disabled or a certain retired person. And employee contributions offset the cost of that over-fifty-thousand coverage."
    },
    {
      "at": "IRS Table I",
      "say": "This is the Table one rate schedule, and it feeds the imputed-income calculation. What it gives you is the monthly cost per one thousand dollars of coverage over fifty thousand, based on the employee's age. It starts cheap and climbs with age. Under twenty-five it is five cents per thousand per month. By fifty to fifty-four you are at twenty-three cents. Fifty-five to fifty-nine jumps to forty-three cents, sixty to sixty-four is sixty-six cents, sixty-five to sixty-nine is one dollar and twenty-seven cents, and seventy and over tops out at two dollars and six cents. The pattern to remember is that the rate stays cheap through mid-career and then accelerates sharply after age sixty, so imputed income really bites for older employees. You will not memorize the whole table, but understand that you look up the employee's age bracket to get the monthly rate."
    },
    {
      "at": "Worked example",
      "say": "Let's work the imputed income exactly the way the exam frames it. John is fifty-two, and his company provides two hundred fifty thousand dollars of group term life. We want the annual tax impact on John. Step one, subtract the fifty thousand dollar tax-free layer: two hundred fifty thousand minus fifty thousand leaves two hundred thousand of excess coverage. Step two, convert that excess to units of one thousand: two hundred thousand divided by one thousand is two hundred units. Step three, look up John's Table one rate. At age fifty-two he is in the fifty to fifty-four bracket, which is twenty-three cents per thousand per month. Step four, multiply and annualize: two hundred units times twenty-three cents is forty-six dollars a month, times twelve is five hundred fifty-two dollars a year. So about five hundred fifty-two dollars gets added to John's W-2. The method never changes: subtract fifty thousand first, divide by one thousand, multiply by the monthly rate, then times twelve if they want the yearly figure."
    },
    {
      "at": "Types of group life coverage",
      "say": "Now the menu of group life coverage types, and two of these are exam favorites. The group carve-out pulls selected, older, higher-paid executives out of the group term plan and gives them individual, discriminatory benefits. It can actually help the group plan come into compliance, nondiscrimination rules do not apply to those execs, and there are tax consequences to the employee. Dependent group life covers a spouse and unmarried children, generally only alongside employee coverage, and here is the number they test, it is limited to two thousand dollars, with spouse coverage convertible. Supplemental group life is contributory term for a class or all employees, and it generally requires evidence of insurability. Group survivors income benefit pays a monthly amount to a surviving spouse or children, with no choice of beneficiary, and the amount is taxable and not treated as life insurance. Then there are group paid-up, group ordinary, and group universal variations that add permanent coverage. The two traps to remember: dependent group life is capped at two thousand dollars, and the group carve-out pulls older, higher-paid execs out."
    },
    {
      "at": "Key employee life insurance",
      "say": "Key employee life insurance covers executives or highly valued employees, and the policy is owned by, applied for by, and payable to the company. Three facts define it. The company owns and is the beneficiary. The death benefit it receives is generally income-tax-free. But, and here is the most-tested point, the premiums are not tax-deductible. The company cannot deduct premiums on key-employee coverage. This shows up constantly as a which is not correct question. Three of the answer choices will be true, that the company owns it, applies for it, and gets a tax-free death benefit, and the false one, your answer, will claim the premiums are deductible. They are not."
    },
    {
      "at": "Conversion of GTL coverage",
      "say": "Quick but testable, the conversion of group term life. When an employee leaves the group, group term typically carries a conversion provision that lets them move to a permanent cash-value policy. Two features to know. The conversion is guaranteed, meaning no new evidence of insurability is required, so a person whose health has declined can still convert. And the tradeoff is that the permanent-policy premium is higher than the group term rate they were paying. So the guarantee protects insurability, but it costs more once you convert."
    },
    {
      "at": "Types of group health coverage",
      "say": "Next up, the types of group health coverage. This is mostly about telling the managed-care plans apart and knowing what the supplemental coverages do. It is lighter on numbers than the life section, but the exam still likes to test how to distinguish an HMO from a PPO, and where group long-term care beats individual coverage."
    },
    {
      "at": "Managed-care & supplemental",
      "say": "Let's line up the managed-care plans, because they sound alike and the exam blurs them. A PPO, a preferred provider plan, gives you a network of providers but still lets you go out of network at a higher cost, so it is the flexible one. An HMO, a health maintenance organization, delivers in-network care through a primary-care gatekeeper, so it is the restrictive, gatekept one. A POS, a point of service plan, is the hybrid, it borrows the HMO's gatekeeping and the PPO's flexibility. The tell is the gatekeeper and out-of-network access: HMO gatekeeps and stays in-network, PPO skips the gatekeeper and allows out-of-network, POS mixes both. And on the supplemental side, group vision covers eye exams, eyeglasses, contact lenses and other corrective items through a network, usually with limited benefits."
    },
    {
      "at": "Group dental & group LTC",
      "say": "Group dental and group long-term care. On dental, know two facts the exam plays with. Group dental covers routine care, cleanings, fillings, crowns, root canals, and orthodontia, but oral surgery is generally covered under health insurance, not dental. And today many dental plans are PPOs, not old-style indemnity plans. If a question claims dental includes oral surgery or that most plans are indemnity, that is your false statement. On long-term care, the comparison is the point. Group LTC is less expensive with lower group rates, and its big edge is that it requires no evidence of insurability. Individual LTC's edge is that it can be fully customized to the person. Employers cannot tailor group LTC per employee, so if the case wants a plan matched to one individual's exact needs, that points to individual coverage."
    },
    {
      "at": "Funding methods & tax-advantaged accounts",
      "say": "Now we hit funding methods and the tax-advantaged accounts, and this is a heavy numbers section, so slow down with me. We will cover Section one twenty-five cafeteria plans, then the alphabet soup, FSAs, HSAs, and the HRA family. The exam loves the dollar limits and the difference between an account you lose and an account you keep, so we will hammer those distinctions."
    },
    {
      "at": "Employer funding & Section 125",
      "say": "Start with how employers fund benefits and the Section one twenty-five cafeteria plan. Funding comes three ways: fully insured, which is traditional, self-insured, or a combination of the two. A Section one twenty-five cafeteria plan lets employees choose among qualified benefits, and it can include a cash option, with the elected qualified benefits taken pretax. The exam trap is what is not cafeteria-eligible. Scholarships and fellowships, educational assistance, employee discounts, and retirement or nonqualified plan benefits are not qualified cafeteria-plan benefits. So if a question asks which benefit cannot go through a cafeteria plan, look for one of those, especially the retirement or education items."
    },
    {
      "at": "Flexible Spending Accounts",
      "say": "Flexible spending accounts, the FSA. Contributions go in pretax, avoiding federal, state, and FICA tax, through the employer. The two thousand twenty-five limit is three thousand three hundred dollars. The defining feature is use-it-or-lose-it, but an employer may allow one of two softeners, either a six hundred sixty dollar rollover into the next year, or a grace period that lets you spend the prior-year balance in the first two and a half months. FSAs cover eligible medical expenses but not over-the-counter items. A DCAP, a dependent-care option, makes dependent-care expenses FSA-eligible. And here is a tested restriction, a self-employed person is not eligible for an FSA, because it is an employee benefit. Anchor the two numbers: three thousand three hundred limit, six hundred sixty rollover."
    },
    {
      "at": "Health Savings Accounts",
      "say": "Health savings accounts, the HSA, and here is where the FSA versus HSA distinction earns you points. The HSA can be funded by the participant, the employer, or both, and unlike an FSA, unused balances accrue and are not tied to the employer, so it is portable and can even be invested in stocks, bonds, index funds, ETFs, and mutual funds. For two thousand twenty-five, the maximum annual contribution is four thousand three hundred single, eight thousand five hundred fifty family. The high-deductible plan minimum deductible is one thousand six hundred fifty single, three thousand three hundred family, and the maximum out-of-pocket is eight thousand three hundred single, sixteen thousand six hundred family. On taxes, qualified medical expenses are always tax and penalty free. Nonmedical withdrawals before sixty-five are ordinary income tax plus a twenty percent penalty, but at age sixty-five and up, nonmedical use is just ordinary income tax with no penalty. That triple tax advantage makes the HSA a strong supplemental retirement vehicle. The one-line contrast: FSA is use-it-or-lose-it and tied to the employer, HSA is portable, rolls over, invests, and outlives the job."
    },
    {
      "at": "HRA family & Medicare MSA",
      "say": "The HRA family and the Medicare MSA. The unifying theme first: all three HRAs are employer-funded only, no employee contributions. The ICHRA, the individual coverage HRA, is self-insured and reimburses substantiated unreimbursed medical expenses, and those reimbursements are not taxed to employees, spouses, or dependents. The QSEHRA is for small employers with fewer than fifty eligible employees that offer no group health plan, it is not a group health plan and not subject to ERISA, and reimbursements are capped at six thousand three hundred fifty dollars single, twelve thousand eight hundred dollars family. The EBHRA, the excepted-benefit HRA, allows up to two thousand one hundred fifty dollars a year for things like dental, vision, and short-term limited-duration insurance, and it cannot reimburse group, individual, or Medicare premiums. The Medicare MSA is offered under a Medicare Advantage, Part C, plan and needs a high deductible. The exam anchors: QSEHRA is fewer than fifty employees, EBHRA is two thousand one hundred fifty dollars, and all three HRAs are employer-funded only."
    },
    {
      "at": "VEBAs",
      "say": "Quick one to close the funding section, VEBAs. A VEBA is a Voluntary Employees' Beneficiary Association, and the key fact is that it is a tax-exempt trust established by the employer to fund employee benefits. That is the definition to recognize. One caveat the deck flags, some benefits are not eligible to be provided through a VEBA. So think tax-exempt employer trust for funding benefits, and you have got it."
    },
    {
      "at": "Regulation & taxation of group health",
      "say": "Now the regulation and taxation of group health. The headliner here is ERISA, plus a short roster of the other big acronyms, COBRA, HIPAA, and PPACA. The exam mostly tests the scope of ERISA, what it does and does not cover, and the general rule that group health premiums are deductible while benefits are not taxed."
    },
    {
      "at": "⚖️ERISA",
      "say": "ERISA, the Employee Retirement Income Security Act of nineteen seventy-four. Its job is to protect benefit-plan participants, establish fiduciary standards, and impose reporting and disclosure requirements. On the reporting side, know the split between what goes to employees and what goes to the government. Employees receive the Summary Annual Report, the Summary Plan Description, the Summary of Material Modifications, and personal benefit statements. The government gets forms like the 5500, the 5330, and the 1099-R. And here is the scope trap. Most employer-sponsored group life plans must meet ERISA's reporting, disclosure, and fiduciary provisions, but they are not subject to the participation, vesting, or plan-termination-insurance rules, because those apply to pension plans, not group life."
    },
    {
      "at": "Other group-insurance regulation",
      "say": "A quick roundup of the other regulation and the tax rule. Three acronyms to recognize: COBRA, the Consolidated Omnibus Budget Reconciliation Act, which is about continuation of coverage. HIPAA, from nineteen ninety-six, the Health Insurance Portability and Accountability Act. And PPACA, from twenty ten, the Patient Protection and Affordable Care Act. On taxation, the general rule for group health is that premiums are generally deductible by the employer, whether that is a C corp, a closely held C corp, an S corp, a partnership, or a sole proprietor, and the benefits paid out are generally not taxed. Deductible in, tax-free out."
    },
    {
      "at": "Group disability coverage",
      "say": "Now group disability, and this section is short but the taxation rule is a guaranteed exam question. The key is a single principle, who pays the premium determines whether the benefit is taxed. We will also touch how group DI differs from an individual policy, but if you take one thing, take the who-paid rule."
    },
    {
      "at": "Group disability",
      "say": "Group disability covers sick pay, short-term disability, and long-term disability. A few features first: group DI generally has no riders, it leans toward a modified any-occupation definition, which is more stringent than own-occupation, and it is usually issued without health questions, which is its biggest advantage. Now the taxation rule, and this is the one to know cold, it follows the premium dollars. If the employer pays the premium, the employee pays tax on the benefit. If the employee pays the premium with after-tax dollars, the benefit comes out tax-free. And if they share the cost, the employee is taxed on only a portion of the benefit. So the shortcut is: employer-paid premium means taxable benefit, employee-paid means tax-free benefit. Whoever got the tax break on the premium loses the tax break on the benefit."
    },
    {
      "at": "Fringe benefits, workers' comp",
      "say": "Last section, fringe benefits, workers' compensation, and unemployment. This is a grab bag, so the exam tends to test a few specific facts: which fringe benefits are nontaxable, the basic nature of workers' comp, and the key features of unemployment insurance. Watch for the two dollar figures and the taxation flags as we go."
    },
    {
      "at": "Nontaxable noncash fringe",
      "say": "Nontaxable noncash fringe benefits, the ones an employee can receive without owing tax. De minimis fringes are small things like limited copier use or occasional business tickets. Working-condition fringes must be business-related and substantiated. Then there are no-additional-cost services, qualified employee discounts, use of on-premises athletic facilities, and meals and lodging furnished for the employer's convenience. The one with a number to memorize is commuter transportation and transit passes, which are excludable up to three hundred twenty-five dollars a month for two thousand twenty-five. So if a question asks the transit-pass exclusion amount, that is three hundred twenty-five dollars a month."
    },
    {
      "at": "Workers' compensation",
      "say": "Workers' compensation. The common themes to recognize: it is mandatory, negligence is not a factor, so it is no-fault, the indemnity is partial but final, benefits are paid periodically, and premiums are treated as a cost of production. On benefits, it covers medical expenses, disability in its temporary and permanent, total and partial forms, death benefits, and rehabilitation. And the tax fact to lock in, workers' comp benefits are not taxed. The deck also tucks in prepaid legal services here, which can cover things like bankruptcy, adoption, divorce legal fees, and estate-planning document preparation, with the employer paying and deducting the cost of maintaining the plan."
    },
    {
      "at": "Unemployment insurance",
      "say": "Finally, unemployment insurance, and there are a few facts the exam reliably tests. It is funded by the employer through federal and state taxes, not by FICA and not by the employee. To be eligible, you need covered employment, a minimum income earned, continued attachment to the workforce, and, critically, your unemployment must be involuntary, so voluntary quitters and those fired for misconduct are denied or limited. The benefit is earnings-based through a state formula, roughly fifty percent of previous earnings up to a state maximum. Duration is set by the state, but typically twenty-six weeks, so if you see forty-six weeks, that is a wrong answer. A waiting period applies, and here is the tax flag, unemployment benefits are taxed. Two anchors: twenty-six weeks typical duration, and remember it is employer-funded, not FICA."
    }
  ];

  window.DECK_TEACH["fp512-m8-kaplan-slides.html"] = [
    {
      "at": "Insurance needs grow with business size",
      "say": "Alright — welcome to Module 8, business uses of insurance. Before we get to the marquee topic, the buy-sell agreement, we start simple: as a business grows, so does its risk, and so does the coverage it needs. This first objective just sets that relationship in your head — size drives the premium and the breadth of protection."
    },
    {
      "at": "What drives the premium",
      "say": "Okay, the premium a business pays comes down to three factors, and the exam wants you to name them. First, the number of employees — more workers means more workers' compensation, more employee liability, and more health obligations under the Affordable Care Act. Second, revenue and business operations — as the business gets more complex, the scope of its risk gets broader. And third, the industry itself — a construction or manufacturing firm carries far higher risk exposure than, say, a quiet consulting shop, so it pays more. So when you size coverage, you're really reading those three dials: headcount, operations, and industry risk. More of any one pushes the premium up."
    },
    {
      "at": "Coverage by size — the ladder",
      "say": "Now picture a ladder of coverage that climbs with business size. A small business needs basic protection like general liability, and it often buys a business owner's policy — a BOP — which bundles that general liability together with property insurance. A medium business adds complexity and more employees, so it layers on workers' compensation, professional liability, and health coverage. A large business goes comprehensive: directors and officers coverage, extensive property and liability, cyber, plus custom industry-specific policies. Here's the key idea the exam tests. Even a small business needs more than liability alone — property damage and employee injury still have to be covered. And a large business can't just self-insure everything, because self-insuring is costly and unpredictable."
    },
    {
      "at": "Conducting a business risk assessment",
      "say": "Now, how does a business actually figure out what it needs? Through a risk assessment. This objective walks the process — and the exam loves to test the ORDER of the steps and one very common misconception about how often you do it."
    },
    {
      "at": "Three fundamental steps",
      "say": "There are three fundamental steps, and the order matters — this is the tested sequence. Step one, risk identification: name the potential threats that could harm the business — financial, operational, legal, and environmental. Step two, risk assessment: evaluate and prioritize those risks by how likely they are, how big the impact would be, and how urgently they need attention. Step three, risk control: put strategies in place to prevent or reduce the risk — insurance, safety protocols, or contingency plans. So it's identify, then assess, then control. And one more point they test: the owner has to stay actively involved. The owner holds the key insights into what makes this business unique, so they collaborate with the agent rather than handing it all off."
    },
    {
      "at": "Building a unique risk profile",
      "say": "This assessment feeds into a tailored risk profile for the business. You conduct the assessment, analyze the information, identify and categorize the risks, quantify the potential losses, and from all that you build a unique risk profile. Now here's the exam trap, and it's a good one. A risk assessment is NOT a once-every-five-years exercise. Risks change fast — with market conditions, technology, and regulation — so you review regularly, not on some lazy five-year cycle. And a second trap in the same family: focusing only on financial risk ignores critical threats like employee safety. A thorough profile covers all the risk types, not just the dollars."
    },
    {
      "at": "Selecting the company, agent",
      "say": "Once you know what the business needs, you pick who provides it — the insurance company, the agent, and the actual policy. This objective is about optimizing each of those three choices, and it leans heavily on how you judge an insurer's financial strength."
    },
    {
      "at": "Optimizing the insurer",
      "say": "Start with the company itself — review its rating. That rating is based on things like cash in reserve, the debt-to-assets ratio, the insurer's ethics and risk management, its revenue streams, and the quality of the policies it underwrites. Then, beyond the raw rating, you weigh overall service quality. That means coverage — how much protection you actually get; claims expertise — how well the company settles claims; price relative to competitors; licensing — because not every company is licensed in every state, so you do your due diligence; and reputation, meaning what peers have experienced. So it's two layers: the financial rating, then the softer service factors on top."
    },
    {
      "at": "Insurance-company financial-strength ratings",
      "say": "Here's a slide worth memorizing cold, because rating scales show up on the exam. Four agencies. A.M. Best runs from A plus plus at the top down to D at the bottom. Standard and Poor's runs triple-A down to D. Moody's runs Aaa down to C. And Fitch runs triple-A down to D. Now the memory hook that untangles them. Only Moody's uses that lowercase-style Aaa scale, AND it's the only one that bottoms out at C rather than D. A.M. Best is the one that tops out at A plus plus. And S and P and Fitch both run the same triple-A down to D. So the tells are: A plus plus means Best, and a bottom grade of C means Moody's."
    },
    {
      "at": "Optimizing the agent",
      "say": "Now the agent and the policy. You want an agent with four things: industry expertise, meaning real experience in the specific industry the business is in; a solid reputation with no disciplinary history and positive reviews; good communication — accessible, responsive, clear about the options; and proper licensing and current credentials. Then here's the trap on the policy itself: cost does not equal value. A low price may actually signal inadequate coverage, and high premiums don't guarantee better protection either. So you prioritize coverage, reliability, price, and budget together, so your comparisons are meaningful — and only then do a thorough review. Don't let a cheap quote seduce you into a gap in coverage."
    },
    {
      "at": "Funding the business's insurance needs",
      "say": "So the business knows what it needs and who to buy from — now, how does it pay for all this without draining cash flow? This objective is about funding the insurance smartly, and it introduces one player the exam likes: the accountant."
    },
    {
      "at": "Managing premium costs",
      "say": "There are several levers to manage premium costs. Bundle coverage for package pricing. Increase deductibles to retain more risk and lower the premium. Compare quotes before you renew. Join professional associations to access group or pooled rates. Reduce the underlying risk. And use accounting consultants to review coverage and optimize the spend. That last one is the key idea: hire an experienced accountant to manage the books, capture tax credits and deductions, and set the optimal premium spend. And here are the things you never do — never allocate one hundred percent of profits to insurance, never insure only the high-risk areas while leaving gaps, and never commingle personal funds, like a home-equity draw, with the business. Those three wrong answers show up in the case questions."
    },
    {
      "at": "The business advisory board",
      "say": "A business advisory board can deliver real insurance-related value. Members bring expert risk assessment and risk-management expertise. They give strategic guidance to shape the insurance-portfolio plan. Experienced pros add negotiation leverage by boosting the firm's reputation and credibility. Legal experts provide compliance and regulatory advice. And the board can offer crisis-management support when a major claim or incident hits. There is a cost, of course — compensation, usually a fixed honorarium per meeting, or equity in a startup; meeting costs like venue, catering, travel, and technology; and administrative costs like staff time and legal contract review. So the board is a resource you pay for, but it can meaningfully sharpen the insurance strategy."
    },
    {
      "at": "The owner's personal insurance needs",
      "say": "We've been talking about the business — but the owner is a person too, with personal coverage needs that must stay separate from the company. This objective is about the owner's own policies and one very testable point about keeping the two worlds apart."
    },
    {
      "at": "Personal essentials — kept separate from the business",
      "say": "The owner's personal essentials include disability insurance, health coverage and health savings accounts, life insurance, personal liability — and here consider an umbrella policy — plus maximizing tax advantages, and key-person insurance for business continuity. Now the exam trap, and it's an important one. Owners often struggle to fund their personal coverage because of cash-flow limits, time constraints, and over-emphasis on the business insurance. The rule: buy DISTINCT business and personal policies. Using business funds to pay for personal insurance creates legal and tax problems. And know this number cold — a non-medical HSA withdrawal triggers a twenty percent penalty tax. So keep the two sets of policies, and the two sets of money, cleanly separated."
    },
    {
      "at": "Small-employer solutions — PEO",
      "say": "Small employers have two clever ways to get large-group pricing, and you should be able to tell them apart. A PEO — a professional employer organization — is the comprehensive one: it outsources health-insurance administration, payroll, and other tasks, with turn-key regulatory compliance. So a PEO handles a broad bundle of functions. An AHP — an association health plan — is the focused one: it's primarily about medical insurance, letting smaller companies tap the savings of large-group medical coverage. The common thread is that both let small employers enjoy the same low rates big corporations get, by pooling their coverage needs with other businesses. The tell: PEO is broad outsourcing including payroll; AHP is mainly medical."
    },
    {
      "at": "Competing goals, buy-sell",
      "say": "Now we reach the heart of the module — the competing goals that pull an owner's life insurance in different directions, and the buy-sell agreement that keeps the business intact. Slow down here, because the buy-sell structures are the single most tested piece of Module 8."
    },
    {
      "at": "Three competing goals for life insurance",
      "say": "An owner's life insurance is pulled toward three competing goals. First, business continuity — without a life-insurance-funded buy-sell, the owner's death can spark disputes among partners, heirs, and creditors, and jeopardize the whole business. Second, family financial security — without coverage, the family faces immediate expenses, debts, and taxes, and heirs might be forced to sell business assets. Third, estate tax liabilities — too little insurance leaves the estate exposed to large estate taxes, possibly forcing a sale of the entire business just to pay the IRS. The solutions map onto each goal: a buy-sell agreement for continuity, life insurance for family protection, and permanent life insurance for the estate tax. And consider a laddered approach — several term policies of different durations and amounts to match needs that change over time."
    },
    {
      "at": "Buy-sell agreement structures",
      "say": "Here it is — the buy-sell agreement, the core business-continuation tool. It funds an orderly transfer of a deceased or departing owner's interest, so the surviving owners keep control instead of ending up with heirs or creditors as their new partners. There are three ways to structure it, and you must know the difference. In a cross-purchase, each owner buys a policy on each OTHER owner, and the survivors purchase the deceased's interest directly. Count the policies: n times n minus one — so three owners means six policies, and it grows fast. In an entity plan, also called stock redemption, the business entity itself owns one policy on each owner and redeems the deceased's interest — so it's just n policies, one per owner. The third is wait-and-see, a hybrid that defers the choice of who buys, owner or entity, until the triggering event, adding flexibility. The tell the exam uses: many owners means cross-purchase policies explode in number, so the entity approach, with one policy each, is far simpler."
    },
    {
      "at": "Private retirement plan funded by life insurance",
      "say": "Life insurance can do more than pay a death benefit — its cash value can fund retirement. This short objective covers the LIRP, and it hinges on one clean distinction between what's tax-deferred and what you can actually pull out tax-free."
    },
    {
      "at": "The LIRP — advantages vs. disadvantages",
      "say": "A LIRP — a life insurance retirement plan — uses a permanent policy's cash value as a supplemental retirement vehicle. The advantages: tax-deferred growth, access to cash value through withdrawals or tax-free loans, a guaranteed death benefit, no contribution limits, protection from market volatility, and ease of management. The disadvantages: higher costs, slower cash-value growth, loans that reduce the death benefit, surrender charges, taxes due on withdrawals above your basis, and limited investment options. Now the exam trap. The cash value grows tax-deferred — the owner does NOT pay annual tax on it. The owner can access that cash value in retirement, but cannot withdraw the entire death benefit tax-free, because the death benefit is for the beneficiaries. One nice perk, though: emergency withdrawals before age fifty-nine and a half can avoid the usual tax penalty."
    },
    {
      "at": "Policies for remote employers — cyber vs fraud",
      "say": "Modern businesses run remote, which opens two very different exposures the exam likes to pit against each other: the digital breach and the dishonest employee. This objective is about the policies that cover a distributed workforce — and keeping cyber and fraud coverage straight."
    },
    {
      "at": "Cyber vs. fraud (fidelity) — a key tested distinction",
      "say": "This is a key tested distinction, so lock it in. Cyber insurance covers the DIGITAL stuff — phishing and spoofing, data-breach costs, ransomware, business interruption, and legal defense and restoration costs. Fraud coverage, also called crime or fidelity coverage, covers the DISHONEST stuff — employee theft, embezzlement, third-party external fraud, fake invoices and vendor impersonation, and dishonesty causing monetary loss. Here's the key point: these are DISTINCT policies, and they do not overlap. Cyber does not cover an employee's act of dishonesty, and fraud does not cover a data breach. So watch for the two-incident question — a hacker breaches the system AND an employee embezzles. Cyber pays the breach and the interruption; fraud pays the embezzlement. Neither one fully indemnifies both, so the right answer splits the incidents between the two policies."
    },
    {
      "at": "Remote workers' compensation",
      "say": "The other essential for a remote employer is workers' compensation — yes, it still applies when people work from home. Remote workers' comp covers on-the-job harm for a distributed workforce: medical expenses, lost wages, disability benefits, and legal costs. And here's the pairing to remember: the two essential policies for a remote employer are cyber insurance and remote workers' compensation. Cyber protects the digital operation; workers' comp protects the people, even scattered across kitchen tables and home offices. If a question asks what the essential remote coverages are, that's the two-item answer."
    },
    {
      "at": "liability solutions — BOP vs CPP",
      "say": "Finally, the commercial property and liability packages. There are two primary ones, a smaller-business package and a larger-business package, and the exam tests which is which and how they're priced. Let's separate the BOP from the CPP."
    },
    {
      "at": "Two primary packages",
      "say": "Two primary packages. The business owner's policy, the BOP, combines property and liability for SMALLER businesses — each insurer has its own version, a package of coverages with add-ons to customize. The commercial package policy, the CPP, is for LARGER businesses — it's a package of monoline forms, business and contents plus general liability, and here's the key point: it's less expensive than buying those individual policies separately. That's the exam trap in a sentence — a CPP's premium is LOWER than the combined premiums of several separate monoline policies each covering one risk. And note that both packages are built mostly from monoline coverage; the CPP just bundles them at a discount. So: BOP for smaller, CPP for larger, and the CPP saves money versus buying piecemeal."
    },
    {
      "at": "The CPP monoline categories",
      "say": "Let's open up the CPP and see what monoline forms it assembles. Think of them in two columns. On the property side: commercial property, boiler and machinery, transportation, and crime. On the liability and other side: commercial liability, commercial auto, and workers' compensation with employer's liability. So a CPP is really a menu — you snap together the individual monoline pieces the business needs. You don't have to memorize the list word-for-word, but recognize that these are the standard building blocks, and that crime coverage sits on the property side while auto and workers' comp sit on the liability side."
    },
    {
      "at": "Commercial liability insurance — the trio",
      "say": "Within commercial liability, know this trio. Employer's liability protects the business from employee lawsuits. Directors and officers coverage — D and O — protects against lawsuits aimed at the board of directors and the officers. And employment practices liability, EPLI, covers lawsuits over inappropriate employment practices, things like discrimination or wrongful termination. Beyond that trio, businesses also carry professional liability and malpractice, errors and omissions, commercial umbrella liability, and social insurance — which here means workers' compensation and unemployment compensation. So the tell: D and O is about the top of the org chart, the board and officers, while EPLI is about how employees are treated, and employer's liability is the general employee-lawsuit protection."
    },
    {
      "at": "malpractice — who buys which",
      "say": "Last slide, and it's a clean exam favorite. Errors and omissions insurance — E and O — is bought by professionals who are positioned to cause their clients FINANCIAL harm: financial planners, accountants, and attorneys. Here's the trap. Physicians generally buy MALPRACTICE insurance, not E and O. Why? Because malpractice addresses bodily harm to patients, while E and O addresses financial harm to clients. So if a question lists financial planners, accountants, attorneys, and physicians and asks who would NOT typically buy E and O, the answer is the physician — they carry malpractice instead. That neatly ties up Module 8: coverage scales with size, run the risk assessment, pick the company and agent carefully, fund it through an accountant, keep personal and business policies separate, use a buy-sell for continuity, and know your commercial packages and liability lines. Nicely done."
    }
  ];

  window.DECK_TEACH["fp511-m2-kaplan-slides.html"] = [
    {
      "at": "Behavioral finance — the frame for this module",
      "say": "Alright — welcome to Module 2, the Psychology of Financial Planning. Let's set the frame before we dive in. Behavioral finance connects behavioral and cognitive psychology to financial planning and economics. Its whole job is to help you understand why people act irrationally during the planning process, and to help clients avoid self-destructive money management. And here's why it matters beyond one person: when a great number of people share the same irrational behavior, those decisions can move the whole economy, not just the individual. Keep three numbers in your head for the module ahead — thirteen cognitive biases, seven emotional biases, and five money disorders. The exam loves to test whether you can sort a named bias into the right bucket, so those counts anchor everything."
    },
    {
      "at": "Risk tolerance & loss aversion",
      "say": "This first objective is about reading a client's appetite for risk — their risk tolerance and their loss aversion — and then making sure your recommendation actually fits that appetite. Sounds simple, but the exam splits risk into several pieces that sound alike, so let's separate them."
    },
    {
      "at": "Matching recommendations to risk propensity",
      "say": "Okay, your job is to analyze a client's degrees of risk tolerance and loss aversion, and make sure recommendations line up with their risk propensity, attitudes, composure, capacity, knowledge, and needs. Kaplan breaks risk into five components, and the exam plays them against each other. Risk tolerance is willingness to accept uncertainty and volatility. Risk preference is the desire for, or aversion to, taking risk. Risk perception is the client's subjective judgment of how much risk is actually involved. Risk capacity is the financial ability to absorb a loss. And risk literacy is the ability to understand and use risk information. Here's the distinction they test hardest: don't blur willingness with ability. Tolerance and preference are about how much risk a client wants; capacity is about how much loss they can actually afford. A good recommendation has to respect both, because a client can want more risk than their finances can survive."
    },
    {
      "at": "Psychology, background & learning style",
      "say": "Now we shift to profiling how a client thinks and takes in information. Two pieces here — a psychological profile built on perception and judgment, and the client's preferred learning style. The learning-style piece shows up on the exam directly, so pay attention."
    },
    {
      "at": "Understanding psychological profiles",
      "say": "A psychological profile helps you predict how a client will perceive and judge your recommendations, and it rests on two building blocks. Perception is how people become aware of things, people, events, or ideas. Judgment is making conclusions about what has been perceived — so first you take it in, then you decide what it means. Personality assessments then place a client along four dichotomies: introverted or extroverted, driven by senses or intuition, influenced by thinking or feeling, and likely to perceive or judge. You don't need to psychoanalyze anyone on the exam — just recognize that these dichotomies exist and that the goal is anticipating how a particular client will react to your advice, not putting them in a box."
    },
    {
      "at": "Three learning styles",
      "say": "Three learning styles, and this one comes back as an actual test question, so lock it in. A visual learner responds to visual objects — graphs, charts, and pictures. An auditory learner retains information by hearing or speaking. And a kinesthetic learner is hands-on — they enjoy physical activity and express themselves with body language. Here's the exam cue that decides the question: graphs, charts, and pictures point to visual. Physical activity and body language point to kinesthetic. The classic trap serves up a kinesthetic client and then slips in graphs and charts as one of the correct answers — that item belongs to the visual learner, not the kinesthetic one. So watch for the mismatch between the style named and the tools listed."
    },
    {
      "at": "Values, culture & the power of context",
      "say": "This objective is about the deeper layer under a client's goals — their attitudes, beliefs, and values, and how their whole context shapes what they want. It's a vocabulary distinction the exam can quiz directly, so let's nail the three terms."
    },
    {
      "at": "Attitudes → beliefs → values",
      "say": "A client's values, including cultural and religious ones, shape their goals and the whole planning process, and there's a tidy hierarchy of three related but distinct ideas. Attitudes reflect a person's opinions, values, and wants. Beliefs reveal one's understanding of some aspect of life — and note, a belief is itself a type of attitude. Values are the attitudes and beliefs a person feels strongly about. So think of it as intensity climbing: attitudes and beliefs are the raw material, and values are the ones held with real conviction. And remember that context greatly influences perspective — past history and current conditions, cultural influences, religious preferences, family circumstances, age, and the client's current life-cycle stage all shape how they see money."
    },
    {
      "at": "Cognitive & emotional biases",
      "say": "This is the heart of the module — the biases. Everything hinges on one master distinction between cognitive and emotional biases, and then you'll learn the named lists. Get the distinction first, because it tells you how you can actually help the client."
    },
    {
      "at": "Cognitive vs. emotional — the master distinction",
      "say": "Here is the distinction the whole biases section rides on. Cognitive biases, also called errors, come from faulty reasoning, information-processing mistakes, or a lack of proper statistical analysis — they're decisions built on well-known concepts that may or may not be correct. Emotional biases are different: they are not related to conscious thought at all — they arise from feelings, impulses, or intuition. And the practical payoff is why the exam cares: because cognitive biases come from thinking, you can correct or mitigate them with coaching and better information. Emotional biases are harder to overcome, so you often have to accommodate them instead. One more tested nuance — when a bias mixes both cognitive and emotional elements, you're more likely to succeed by focusing on the cognitive issues, since those are the ones you can actually reason a client out of."
    },
    {
      "at": "The 13 cognitive biases",
      "say": "Here are the thirteen cognitive biases — the reasoning errors. You won't recite all thirteen, but you must recognize a scenario and name the right one, so let me hit the ones that get tested. Illusion of control is believing you can influence outcomes you actually can't. Money illusion is focusing on nominal dollars instead of real, inflation-adjusted value. Conservatism is clinging to prior views and under-reacting to new information. Hindsight is the I-knew-it-all-along effect. Confirmation is seeking only information that confirms what you already believe. Representativeness is judging by stereotypes. Mental accounting is treating money differently by its source or purpose. Cognitive dissonance is the discomfort of conflicting beliefs. Self-attribution credits wins to skill but blames losses on bad luck. Anchoring over-relies on an initial reference point. Outcome bias judges a decision only by its result. Framing is being swayed by how information is presented. And recency is overweighting recent events. The common thread: every one of these is a thinking mistake, which is why coaching can fix them."
    },
    {
      "at": "The 7 emotional biases",
      "say": "Now the seven emotional biases — the ones rooted in feelings, and therefore harder to coach away. Loss aversion means losses hurt more than equivalent gains feel good. Overconfidence is overestimating your own knowledge. Self-control bias favors short-term gratification over long-term goals. Status quo is preferring things stay the same — plain inertia. Endowment is valuing an asset more simply because you already own it. Regret-aversion is avoiding action out of fear of making a wrong decision. And affinity is making decisions that reflect your values or align with a group. Now the trap they love: endowment versus status quo. Endowment means a client won't sell because the asset feels special because it's owned — think inherited or sentimental stock. Status quo means they won't sell simply to avoid changing anything, with no attachment to that particular asset. If the story stresses sentiment or ownership, it's endowment; if it's just inertia, it's status quo."
    },
    {
      "at": "Money scripts, comfort zones & disorders",
      "say": "This objective looks at what drives a client's everyday money behavior — the beliefs and comfort zones underneath it — and then the five disordered money behaviors the module names. Let's start with the two core ideas."
    },
    {
      "at": "What drives day-to-day money behavior",
      "say": "A client's psychology — their financial comfort zone, their socialization, their money beliefs, and their past experiences — shapes their objectives, their decision-making, and their actions. Two core ideas anchor this. Money scripts are a client's underlying money beliefs, usually formed early in life and largely unconscious — the tapes running in the background that they may not even know they hold. Financial comfort zones are the range of financial behavior a client feels at ease with — how much saving, spending, risk, or debt sits inside their comfort. When a recommendation pushes a client outside that comfort zone or collides with a deep money script, expect resistance, and that's exactly the kind of situation the exam frames."
    },
    {
      "at": "Five money disorders",
      "say": "Five disordered money behaviors named in this module — know them by description, because the exam will describe one and ask you to name it. Gambling disorder is compulsive gambling despite harmful consequences. Compulsive buying is an uncontrollable urge to shop and spend. Financial dependence, nicknamed affluenza, is relying on money one did not earn. Financial enabling is giving money in a way that harms the recipient — the person who can't say no. And hoarding disorder is a persistent difficulty parting with possessions. Watch the pair that sound similar: financial dependence is about the person living off unearned money, while financial enabling is about the person doing the giving. One receives, the other provides — same relationship, opposite roles."
    },
    {
      "at": "Motivation & financial wellbeing",
      "say": "This short objective is about a client's motivation and their overall financial wellbeing — the emotional and mental side of money, not just the numbers. It introduces a handful of terms that pair the technical plan with the client's inner life."
    },
    {
      "at": "Toward financial wellbeing",
      "say": "Here you identify what actually motivates a client to pursue their goals, and the module gives you a vocabulary for it. Financial wellbeing is the overarching aim — security and freedom in one's financial life. Integrated financial planning blends the technical plan with the client's inner life. Then a clean pair: exterior finance is the objective, technical side — the numbers, products, and strategies — while interior finance is the client's feelings, beliefs, and psychology about money. And financial therapy blends financial approaches with therapeutic, mental-health ones. The tell the exam uses is the exterior-versus-interior split: if the phrase points to products and calculations, that's exterior; if it points to emotions and beliefs, that's interior. Good planning integrates both."
    },
    {
      "at": "Financial transparency with family",
      "say": "Now we move into the family and relationship side of planning. This objective is about financial transparency — why being open about money matters within a household, and what happens when it's missing."
    },
    {
      "at": "Why transparency matters",
      "say": "Financial transparency does real work in a relationship. It fosters honesty and trust. It requires spouses and family members to be clear and unambiguous about financial matters — no hidden accounts, no vague answers. And the flip side is the risk: a lack of transparency can sabotage attaining shared goals, because you can't reach a goal together if one partner is operating on incomplete information. There's a nice fallback principle here too — even if partners' goals genuinely differ, at the very least each partner should respect the other's goals. So the exam-worthy takeaway is that transparency is the foundation of trust, and where goals diverge, mutual respect is the floor you don't drop below."
    },
    {
      "at": "Spotting financial conflict",
      "say": "This objective trains you to spot financial conflict between partners — both the behaviors that signal it and the underlying sources it springs from. There's one big principle about how you weigh what you observe, so watch for it."
    },
    {
      "at": "Behaviors & sources of conflict",
      "say": "Two lists here — behaviors that signal conflict, and the sources conflict comes from. Signals to watch for include partners arguing during sessions, saying they discuss disagreements at home, one partner speaking far more than the other, interrupting or speaking over each other, nonverbal behaviors tied to tension, and criticizing or speaking sarcastically. The sources are things like family-of-origin treatment of money, inadequate communication, different risk-tolerance levels, adult children, blended families, and cultural differences. And here is the principle the exam tests directly: to identify conflict, you weigh what partners say and how they say it equally. Nonverbal behavior is as important as the spoken word. If an answer choice claims nonverbal cues matter less than spoken words, that choice is wrong — they carry equal weight."
    },
    {
      "at": "Agreeing on goals together",
      "say": "Short objective, but a real exam concept: goal incongruence — what happens when partners can't agree on their goals, and what you as the planner do about it."
    },
    {
      "at": "Goal incongruence",
      "say": "Goal incongruence results from conflicting goals, or from indecision when partners are trying to establish those goals in the first place. The module makes a point of saying this is common for partners — it's normal, not a red flag about the relationship. Your job is that finding common ground is key, and you get there by encouraging partners to share openly. So the exam framing is straightforward: when two partners want different things, the planner doesn't pick a winner — you facilitate open sharing and steer them toward the overlap where they actually agree. Recognize goal incongruence by name, and remember the fix is common ground reached through open communication."
    },
    {
      "at": "Money as undue influence & abuse",
      "say": "This objective covers the darker side of money in relationships — when it's used for undue influence, control, or outright abuse. There are three named forms, and they escalate, so learn to tell them apart."
    },
    {
      "at": "Three forms of financial manipulation",
      "say": "Three forms of financial manipulation, where money becomes a tool for power over another person. Financial control is when one party dominates the financial decisions to hold power over another. Financial enabling, also called financial enmeshment, is about blurred boundaries — providing money in ways that foster unhealthy dependence. And financial abuse is using money to control, coerce, or harm another person. Notice the escalation: control is domination of the decisions, enabling is unhealthy dependence through blurred boundaries, and abuse is money used as an outright weapon. Watch the overlap with the disorders section — financial enabling appears in both, so if a question stresses blurred boundaries and dependence, enabling and enmeshment are your words."
    },
    {
      "at": "Counseling theory in practice",
      "say": "Now we get into counseling theory applied to financial planning. This objective names several counseling approaches, each with a different emphasis. You'll want to match the approach to its core idea."
    },
    {
      "at": "Financial counseling approaches",
      "say": "Four counseling approaches, each with its own lens on client behavior. The economic and resource approaches come in two flavors: the classical economic version assumes people make rational, utility-maximizing financial decisions, while the strategic management version is about managing resources strategically to reach goals. The cognitive-behavioral approach works to change unhelpful thoughts and behaviors around money — notice it's the one that targets thinking and habits directly, which fits everything you learned about correcting cognitive biases. And the psychoanalytic approach explores how the unconscious and past experiences shape money behavior — this is the one that digs into childhood and money scripts. The exam tell: if the approach assumes rationality, it's classical economic; if it changes thoughts and behaviors, cognitive-behavioral; if it digs into the unconscious and the past, psychoanalytic."
    },
    {
      "at": "Building honesty & trust",
      "say": "This objective is about building honesty and trust across cultural differences. It hinges on a two-term distinction — cultural competence versus cultural humility — and where you have to start before either one."
    },
    {
      "at": "Cultural competence vs. cultural humility",
      "say": "To build a relationship of honesty and trust, a planner first has to understand their own identities — and then bring two things. Cultural competence is the knowledge and skill to work effectively across cultures. Cultural humility is the ongoing self-reflection and openness that comes from recognizing you can never fully master another person's culture. That's the distinction the exam draws: competence is a set of skills you can build, while humility is the humble, never-finished attitude that you'll always have more to learn. And the anchoring idea is start with self — trust begins when planners understand their own identity and biases before they judge the client's. You look inward first, then outward."
    },
    {
      "at": "Communication, listening & connection",
      "say": "Our last teaching objective covers communication, listening, and how relationships deepen. Three slides here — the components of communication, active listening skills, and social penetration theory. These are the soft-skill mechanics of the client relationship."
    },
    {
      "at": "Components of communication",
      "say": "Interpersonal communication — communicating one-on-one — runs through the entire planning process, and it uses both oral and nonverbal skills. The module splits it into verbal and non-verbal. On the verbal side you have pitch and tone — notice these aren't the words themselves, they're the vocal qualities of how you say them. On the non-verbal side you have body language, eye contact, and spatial communication, which is how you use physical distance and space. The exam point that ties back to the conflict section: so much of the message is non-verbal that you can't just listen to the words — you read the body language, the eye contact, and the space. Verbal and non-verbal skills work together throughout the relationship."
    },
    {
      "at": "Active listening skills",
      "say": "Active listening is described as key to effective communication, and the module names three core techniques. Leading responses are prompts that encourage the client to keep talking — open-ended nudges that draw them out. Mirroring is reflecting the client back, and it comes in two forms: physical mirroring, matching their posture or gestures, and verbal mirroring, echoing their words or feelings. And emotional intelligence is reading and responding to the client's emotions in the moment. The through-line is that active listening isn't passive — you're actively prompting, reflecting, and tuning into feeling. If a question describes a planner echoing a client's own words back to them, that's mirroring; if it's about sensing and responding to emotion, that's emotional intelligence."
    },
    {
      "at": "Social penetration theory",
      "say": "Social penetration theory explains how relationships deepen over time. As a relationship develops, it becomes less superficial and more personal and private, and it grows specifically as the participants disclose information about themselves. The engine is disclosure — the more you open up, the deeper the relationship gets. It moves through four stages in order: orientation first, then exploration, then affective exchange, and finally stable exchange. Picture it as a staircase — each step down means more disclosure and a deeper, more private relationship. For the exam, know the sequence and know the driver: relationships progress from orientation to stable exchange, and self-disclosure is what carries them from one stage to the next. Learn the order cold, because the four stages in sequence is the testable piece."
    }
  ];

  window.DECK_TEACH["fp511-m4-kaplan-slides.html"] = [
    {
      "at": "calculator & the five TVM",
      "say": "Alright — welcome to Module 4, the Time Value of Money. Before we solve anything, we have to get comfortable with the tool: your HP 10bII calculator and its five TVM keys. This whole first objective is just setup and vocabulary. Get the machine configured right and the sign conventions straight, and the rest of the module is mostly plugging numbers into the right registers."
    },
    {
      "at": "Set up the HP 10bII",
      "say": "Okay, four settings you configure once and re-check on exam day. First, set payments per year to one — press one, then downshift, then the P per Y R key, and the display should read one P per Y R. Second, set the display to four decimals — four, downshift, DISP, and you'll see zero point zero zero zero zero. Third, the mode: BEG versus END. The calculator defaults to END, and you toggle it with downshift BEG slash END. Fourth, and build this into a habit — clear all memory before every single problem with downshift, C ALL. Here's the trap: if you don't clear, old entries from the last problem contaminate the next answer. So clear memory before you start each new problem, every time."
    },
    {
      "at": "Five values — you need at least three",
      "say": "Every TVM problem is built from five registers, and the rule is simple: enter any three, sometimes four, and solve for the missing one. Present value, future value, payment, N the number of periods, and I per Y R the interest rate. Two things to lock in. Number one, N and the rate must match the same period — if N is in months, the rate has to be a monthly rate. Number two, the sign convention, and this is where people crash. Outflows are negative, inflows are positive. Money you put in gets a minus sign; money you get back is positive. And here's the trap: the plus-minus key that makes a number negative is NOT the subtraction key. Enter the number first, then press plus-minus. Mix those two keys up and your answer is garbage."
    },
    {
      "at": "Future value (FV)",
      "say": "Now, objective on future value. Future value answers one question: if I let a lump sum or a stream of deposits grow at a given rate for a given time, what will it be worth down the road? We'll do it two ways — a single amount growing, and an annuity of equal deposits accumulating toward a goal."
    },
    {
      "at": "FV of a single amount",
      "say": "Future value of a single amount is what a lump sum grows to over time at a set rate, and the engine is compounding — earning interest on an ever-larger balance of principal plus prior interest. Let's work Brenden's problem. He buys an antique chair today for twenty thousand dollars, and it's expected to grow five percent a year for five years. In END mode: clear with downshift C ALL, then enter the twenty thousand as a NEGATIVE present value — twenty thousand, plus-minus, PV — because it's money going out. Then five, I per Y R for the rate, and five, N for the term. Solve for future value and you get twenty-five thousand five hundred twenty-five dollars and change, or about twenty-five thousand five hundred twenty-six. Notice the lump sum went in negative and the answer came back positive — that's the sign convention working for you."
    },
    {
      "at": "FV of an annuity",
      "say": "Future value of an annuity is for a systematic savings program — equal, regular deposits building toward a goal. Now the timing distinction the exam loves: an annuity due pays at the BEGINNING of each period, like a lease; an ordinary annuity pays at the END, like a mortgage. Same deposits, but beginning-mode payments each earn one extra period of interest, so an annuity due always ends up worth more. Jude's problem: at the start of each year for ten years he deposited a thousand dollars earning four percent. Because it's start-of-year, switch to BEG mode after clearing. Then a thousand, plus-minus, PMT for the deposit going out, four, I per Y R, and ten, N. Solve for future value: twelve thousand four hundred eighty-six dollars and thirty-five cents. Here's the trap — deposits at the beginning need BEG mode, but the calculator defaults to END. Always confirm the mode matches the problem."
    },
    {
      "at": "Present value (PV)",
      "say": "Now we flip it around to present value. Present value asks: what is a future dollar worth in today's money? We discount it back over time at a given rate. Two forms again — a single future amount, and an annuity, a stream of equal future payments."
    },
    {
      "at": "PV of a single amount",
      "say": "Present value of a single amount is what a future dollar is worth today, discounted over a number of periods at a rate. Key intuition: the further out the money is, or the higher the discount rate, the LOWER the present value. Christie's problem: she expects forty thousand dollars in five years, and she wants its value today at a four percent after-tax rate. In END mode, clear, then enter forty thousand as the future value. Then four, I per Y R, and five, N. Solve for present value and you get about thirty-two thousand eight hundred seventy-seven dollars — it shows as negative on the display, which is just the sign convention flipping the answer opposite the input. So forty thousand five years out is worth roughly thirty-two thousand eight hundred seventy-seven today."
    },
    {
      "at": "PV of an annuity",
      "say": "Present value of an annuity is what a series of equal future payments is worth today. Nicholas can receive a thousand dollars at the end of each year for ten years, and he wants a ten percent annual return — so what would he pay for that stream? In END mode, clear, and here's the important step: set future value to zero, because this is an annuity only, no lump sum at the end. Zero, FV. Then a thousand, PMT, ten, I per Y R, and ten, N. Solve for present value: six thousand one hundred forty-four dollars and fifty-seven cents. So a ten-year, thousand-dollar-a-year stream is worth about six thousand one hundred forty-four today at a ten percent required return. Don't forget to zero out FV, or the calculator assumes a balloon payment that isn't there."
    },
    {
      "at": "Rate of return (I/YR)",
      "say": "This objective is about solving for the rate itself. When you know what you put in, what you got out, and how long it took, the calculator can back out the annual compound rate of return. That rate matters for comparing investment performance, and it's the foundation for the uneven-cash-flow work — net present value and internal rate of return — coming later."
    },
    {
      "at": "Solving for the annual compound rate",
      "say": "Solving for I per Y R gives you the average annual compound rate that links a beginning value to an ending value. Abrianna's problem: seven years ago she bought a hundred shares at ninety dollars each — that's nine thousand dollars in — and today she sold all hundred for forty-five thousand. In END mode, clear, then enter the cost as a negative present value: nine thousand, plus-minus, PV, because that's money out. Then the sale value as future value, forty-five thousand, FV, and the term, seven, N. Solve for I per Y R and you get twenty-five point eight five percent. That's her average annual compound rate before tax. The trick is the sign discipline — cost in negative, proceeds in positive — or the calculator can't find a rate."
    },
    {
      "at": "Number of compounding periods",
      "say": "This objective covers the flip side of time — solving for N, the number of periods — and it introduces a handy shortcut, the Rule of 72. We'll do an exact calculation for N first, then the mental-math trick that gets you close in seconds."
    },
    {
      "at": "Solving for N",
      "say": "Solving for N tells you how many periods it takes for a value to grow into a target — how long a present value needs to reach a future value at a given rate. Connor's problem: he invested eight thousand dollars, it's worth fifteen thousand today, and it earned twelve percent a year. About how long was it invested? In END mode, clear, then enter the original amount as a negative present value: eight thousand, plus-minus, PV. Then today's value as future value, fifteen thousand, FV, and the rate, twelve, I per Y R. Solve for N and you get five point five five years. Same sign discipline as always — the starting amount goes in negative, the ending amount positive."
    },
    {
      "at": "Rule of 72 — the doubling shortcut",
      "say": "The Rule of 72 is the doubling shortcut, and it works two directions: divide 72 by the rate to get the years to double, or divide 72 by the years to get the rate you'd need. Madelyn puts her cash into an account earning ten percent, compounded annually, no additions or withdrawals — about how long to double her money? The shortcut: seventy-two divided by ten equals seven point two years. Now compare that to the exact TVM answer. Set present value to one, future value to two, rate to ten, payment to zero, and solve N — you get seven point three years. Here's the trap the exam sets: the Rule of 72 is an APPROXIMATION only. The exact answer, seven point three, differs slightly from the shortcut, seven point two. If a question gives you both, know that seven point two is the Rule of 72 result and seven point three is the precise one."
    },
    {
      "at": "Level periodic payment (PMT)",
      "say": "This objective is about solving for the level payment — the fixed, equal amount you'd put in each period to hit a goal. These are unchanging payments, and the twist here is a problem that blends a lump sum today with a stream of end-of-year payments, all working toward one target."
    },
    {
      "at": "Fixed (equal) payments toward a goal",
      "say": "Fixed payments are equal and unchanging over the whole period, and this problem combines a single sum today with a stream of level end-of-year payments. Shanice wants ninety thousand dollars in seven years. She can deposit thirty-two thousand today at eleven percent and add an equal payment at the end of each year — what payment gets her there? In END mode — confirm END — enter the deposit as a negative present value: thirty-two thousand, plus-minus, PV. Then the goal as future value, ninety thousand, FV, the term seven, N, and the rate eleven, I per Y R. Solve for payment and you get two thousand four hundred eight dollars and forty-nine cents per year. So the thirty-two thousand grows on its own, and these annual payments fill the rest of the gap to ninety thousand."
    },
    {
      "at": "Loan payment & amortization",
      "say": "Now we shift to the borrowing side — loan payments and amortization. This is monthly-payment territory, so the big new skill is matching the calculator to a monthly loan. Get the periods-per-year setup right and you can find the payment, then break any point in the loan into principal paid versus interest paid."
    },
    {
      "at": "How amortization works",
      "say": "Amortization is just the repayment of loan principal over time, and an amortization schedule shows how each payment splits between principal and interest. The pattern to know cold: early payments are mostly interest and little principal; as the loan ages, the principal portion rises and the interest portion falls. Now the calculator setup that trips people up. For a monthly loan, set twelve P per Y R, and enter the term in YEARS using the x P per Y R key — that's downshift, then N. So for a fifteen-year loan you press fifteen, downshift, N, and the calculator converts it to a hundred eighty monthly periods for you. Let the machine do the conversion instead of multiplying by twelve in your head."
    },
    {
      "at": "Jake & Jamie's mortgage",
      "say": "Let's work Jake and Jamie's mortgage: a hundred fifty thousand dollars at three point two five percent over fifteen years, and they want a status check after twenty-four months. Step one, the monthly payment. Confirm END, set twelve P per Y R, then clear. Enter a hundred fifty thousand as present value, then fifteen, downshift, N — the display shows a hundred eighty periods — then three point two five, I per Y R. Solve for payment: about one thousand fifty-four dollars a month. Step two — and do NOT clear — amortize periods one through twenty-four: press one, INPUT, twenty-four, then downshift, AMORT. Now press equals to toggle the totals through month twenty-four. Principal paid, sixteen thousand forty dollars and three cents. Interest paid, nine thousand two hundred fifty-six dollars and five cents. Remaining balance, one hundred thirty-three thousand nine hundred fifty-nine dollars and ninety-seven cents. Notice how much of those first two years went to interest, not principal."
    },
    {
      "at": "total interest over the life of a loan",
      "say": "Now total interest over the entire life of a loan — Rasheed and Adi. They bought a home for a hundred seventy-five thousand, put forty thousand down, and financed the remaining a hundred thirty-five thousand over fifteen years at three point eight five percent. Set twelve P per Y R, clear, and enter the financed amount, a hundred thirty-five thousand, as present value — that's the loan, not the purchase price. Enter fifteen, downshift, N for a hundred eighty periods, then three point eight five, I per Y R, and solve for payment: nine hundred eighty-eight dollars and forty-six cents a month. Now the total-interest trick: total payments minus the original principal. Nine hundred eighty-eight forty-six times a hundred eighty periods is a hundred seventy-seven thousand nine hundred twenty-three dollars and four cents. Subtract the hundred thirty-five thousand borrowed, and the interest over the life of the loan is about forty-two thousand nine hundred twenty-three dollars."
    },
    {
      "at": "Inflation-adjusted interest rate",
      "say": "This objective introduces the real, or inflation-adjusted, rate — one of the most misunderstood ideas on the exam. It is NOT just your return minus inflation. There's a specific ratio formula, and using the naive subtraction instead is a classic wrong answer."
    },
    {
      "at": "The real (inflation-adjusted) rate",
      "say": "The real rate discounts your return BY inflation — it's not simply the difference between them. You need it whenever a payment is compounding and adjusting for inflation at the same time, which is the serial-payment work coming next; skip it and your answer drifts further off the more payments there are. The formula: take one plus the rate of return, divide by one plus the inflation rate, subtract one, then multiply by a hundred. With a seven percent return and three percent inflation: one point zero seven divided by one point zero three is about one point zero three eight eight; subtract one and multiply by a hundred and you get three point eight eight percent. Here's the trap — the naive subtraction, seven minus three equals four percent, is WRONG. The real rate is three point eight eight, not four. Always use the ratio formula."
    },
    {
      "at": "Serial (inflation-adjusted) payments",
      "say": "This objective builds on the real rate to handle serial payments — payments that rise each year with inflation so they hold constant purchasing power. It's a multi-step calculation: find a base payment at the real rate, then inflate it forward year by year. This is a favorite for a longer exam question."
    },
    {
      "at": "Payments that rise with inflation",
      "say": "Serial payments increase each year by inflation to keep the same real purchasing power. Two facts to know: the first serial payment is LESS than the equivalent fixed payment, and the last one is GREATER, but it holds the same purchasing power as the first. Ty and Skylar want a beach house in five years and need a hundred fifty thousand in today's dollars, expecting a ten percent return and four percent inflation, paying at year-end. Step one, the base payment at the real rate: clear in END mode, set future value to a hundred fifty thousand, present value to zero. Use the inflation-adjusted rate — one point ten divided by one point zero four minus one, times a hundred, is five point seven six nine two percent — with N of five, and solve payment: about twenty-six thousand seven hundred thirty-two dollars. Step two, inflate that base by four percent each year: the end-of-year-two payment works out to about twenty-eight thousand nine hundred fourteen, and the end-of-year-five payment to about thirty-two thousand five hundred twenty-four."
    },
    {
      "at": "Single sum and annuity payment",
      "say": "This objective handles problems that carry both a lump sum and a payment stream at the same time. A single TVM calculation can hold an initial single sum in the present-value register AND a recurring payment in the PMT register — you just enter both."
    },
    {
      "at": "both a lump sum and a stream",
      "say": "One calculation can carry both an initial lump sum as present value and a recurring annuity as payment — like depositing two thousand today and adding two hundred fifty each year end. Let's work Raul: he deposits twenty thousand into a mutual fund, then adds two thousand five hundred at the end of each year, at nine percent for eight years — what's it worth? In END mode with one P per Y R, clear, then enter term and rate: eight, N, nine, I per Y R. Now the key step — both the lump sum and the payment are money going out, so BOTH go in negative. Twenty thousand, plus-minus, PV, then two thousand five hundred, plus-minus, PMT. Solve for future value and you get sixty-seven thousand four hundred twenty-two dollars and forty-four cents. The lump sum and the annuity both grow inside the same calculation — that's the whole point here."
    },
    {
      "at": "Internal rate of return (IRR)",
      "say": "Now we move into uneven cash flows and the internal rate of return. When money goes in and out at different times and in different amounts, the simple five-key setup can't handle it — you use the cash-flow keys instead. This objective is all about the keystroke rules for entering those flows correctly."
    },
    {
      "at": "Cash-flow keystroke rules",
      "say": "The cash-flow rules: inflows positive, outflows negative. First, figure out the compounding period — it's the time between two consecutive cash flows. Then enter a cash flow, or a zero, for EVERY period in the holding window — you can't skip empty years. The first outflow, usually the purchase, is CF-zero at period zero. And you can group equal consecutive flows with the Nj key, that's downshift on the CF-j key. Work the antique chair: bought six years ago for a thousand, repaired at the end of year two for four hundred fifty, just sold for two thousand eight hundred fifty. Every period gets an entry. Clear, then a thousand, plus-minus, CF-j for the purchase. Zero for year one, then four hundred fifty, plus-minus, CF-j for the repair. Then group the three zero years — zero, CF-j, three, downshift, Nj — and finally two thousand eight hundred fifty, CF-j for the sale. Solve for IRR per year: thirteen point two five percent."
    },
    {
      "at": "IRR with quarterly cash flows",
      "say": "Now IRR when the flows are quarterly — and the twist is you solve a periodic rate, then annualize. A three-year fund pays quarterly distributions, not reinvested: four at five hundred, four at five hundred seventy, four at six hundred. The initial investment was a hundred twenty thousand, and the final account value at the last distribution was a hundred sixty-five thousand. Clear in END mode, one P per Y R. Enter CF-zero as a negative: a hundred twenty thousand, plus-minus, CF-j. Group the equal flows — five hundred, CF-j, four, downshift, Nj; five hundred seventy, CF-j, four, downshift, Nj; then six hundred, CF-j, but only THREE, downshift, Nj. Here's the trap: the twelfth six-hundred distribution is folded into the final flow with the account value — six hundred plus a hundred sixty-five thousand is a hundred sixty-five thousand six hundred, entered as the last CF-j. Solve the periodic IRR, three point zero eight nine four, then multiply by four to annualize: twelve point three six percent."
    },
    {
      "at": "net present value (NPV) of uneven cash flows",
      "say": "The final objective is net present value — NPV — for uneven cash flows. It's closely related to IRR but answers a different question: at a required rate you pick, does this investment add value? A positive number means yes, negative means no. Let's see exactly what it tells you and how to compute it."
    },
    {
      "at": "What NPV tells you",
      "say": "NPV evaluates capital projects: it's the total present value of the cash flows minus the initial cost. Read it simply — a POSITIVE NPV means the investment earns MORE than your required discount rate; a NEGATIVE NPV means it earns less. Abby's equipment costs a hundred thousand and can be sold for forty thousand at the end of year five. Over five years it throws off twenty-five, thirty, twenty, fifteen, and ten thousand. At an eight percent opportunity cost, what's the NPV? Clear, enter the cost as CF-zero negative: a hundred thousand, plus-minus, CF-j. Then years one through four: twenty-five thousand, thirty thousand, twenty thousand, fifteen thousand, each CF-j. Now the year-five trick — combine the final ten thousand cash flow with the forty thousand sale price into fifty thousand, CF-j. Enter the rate, eight, I per Y R, then downshift, NPV. The result is about nine thousand eight hundred dollars — positive, so the project beats the eight percent hurdle and she should invest."
    }
  ];

  window.DECK_TEACH["fp511-m5-kaplan-slides.html"] = [
    {
      "at": "Does the relationship constitute Financial Planning?",
      "say": "Alright, welcome to Module 5 on Professional Conduct and Fiduciary Responsibility. This first objective answers one question the exam leans on constantly: is this relationship actually financial planning, or just advice? That distinction matters, because how much you owe the client scales with the answer. Keep that dial in your head as we go."
    },
    {
      "at": "What is Financial Planning?",
      "say": "Okay, start with the official definition, because the exam quotes it almost word for word. The CFP Board's Code of Ethics and Standards of Conduct defines financial planning as a collaborative process that helps maximize a client's potential for meeting life goals through financial advice that integrates relevant elements of the client's personal and financial circumstances. Notice three load-bearing phrases: collaborative process, meeting life goals, and integrates relevant elements. It commonly touches income tax planning, budgeting, insurance planning, asset allocation, and retirement planning. And here is the tell the exam wants: it is a process, not a product. If an answer choice calls financial planning a product used to hit a goal, that choice is wrong on its face."
    },
    {
      "at": "What is Financial Advice?",
      "say": "Now financial advice, which is the narrower idea. It is a communication that would reasonably be viewed as a recommendation for a particular course of action. Regarding what? The development or implementation of a financial plan; the value of investing in, purchasing, holding, or selling financial assets; investment policies or strategies, portfolio composition, or the management of financial assets; and the selection and retention of other persons to provide professional services to the client. And here is one people forget: it also includes the exercise of discretionary authority over a client's financial assets. So if a planner has discretion, that alone counts as financial advice. The keyword throughout is recommendation for a particular course of action. General, non-recommending communication does not clear that bar."
    },
    {
      "at": "not Financial Advice?",
      "say": "So what is not financial advice? Four things a reasonable CFP professional would not treat as advice. First, directed orders, meaning a response to a client's own directed order is not advice, you are just executing what they told you to do. Second, marketing materials, which are general promotional content. Third, general financial education, which is educational and not tailored. And fourth, general financial communications that are broad and non-individualized. Now the concept that ties it together, the customization test: the more customized a planner's communications are to that specific client's situation, the greater the likelihood financial advice is being provided. So generic equals not advice, tailored to this person equals advice. On the exam, the response to a directed order is the classic not-advice answer."
    },
    {
      "at": "When does Financial Advice",
      "say": "Okay, so advice is happening, but when does that advice actually require financial planning? Answering yes to these confirms financial planning is being provided. One, has the planner agreed to provide, or already provided, financial planning? Two, does the client have a reasonable basis to believe the planner will provide, or has provided, financial planning? And three, do the integration factors, applied to the relevant elements, require the financial advice to integrate the client's circumstances? So it can be triggered by an actual agreement, by the client's reasonable belief, or by the nature of the advice itself. Any one of those can pull you up into full financial planning, which is why you cannot just dodge the duties by never saying the words financial plan."
    },
    {
      "at": "Relevant Elements",
      "say": "Here is a slide the exam builds traps around, so slow down with me. There are two separate lists and they get deliberately swapped. The relevant elements of financial planning describe what planning touches: developing client goals, managing assets and liabilities, managing cash flow, and identifying and managing risks. The integration factors are the variables that weigh whether advice rises to planning: the number of relevant elements the advice may affect, the portion and amount of financial assets affected, the length of time the client's circumstances may be affected, the effect on the client's overall exposure to risk, and any barriers to modifying the actions taken to implement the advice. The tell: relevant elements are what planning touches; integration factors are how you decide if advice becomes planning. The exam swaps these lists to bait you, so read each item and ask which column it belongs to."
    },
    {
      "at": "What you owe grows as the relationship deepens",
      "say": "This is the payoff slide for the whole objective. Your obligations accumulate in tiers, and each higher tier keeps everything below it and adds more. At all times, the base tier, you owe the Code of Ethics and the Standards of Conduct that apply at all times. Then, when you are providing financial advice, you add the fiduciary duty and the requirement to manage conflicts of interest. And when that advice requires financial planning, you add the Practice Standards, the seven-step process. So the moment a client engages financial planning, the full stack applies, including the seven-step Practice Standards. Picture it as a staircase: the deeper the relationship, the higher you climb, and you never drop the steps beneath you. Remember, personal financial planning is a process, not an investment product."
    },
    {
      "at": "six principles of the Code of Ethics",
      "say": "Now the heart of the module, the Code of Ethics itself. This is pure recall and application: six principles you need cold, because the exam hands you a scenario and asks which one was violated."
    },
    {
      "at": "must be upheld",
      "say": "Know these six cold. The Code of Ethics must be upheld in all instances and encounters, and the Standards that apply at all times must be followed too. Principle one: act with honesty, integrity, competence, and diligence. Principle two: act in the client's best interests. Principle three: exercise due care. Principle four: avoid, or disclose and manage, conflicts of interest. Principle five: maintain the confidentiality and protect the privacy of client information. And principle six: act in a manner that reflects positively on the financial planning profession and CFP certification. Here is the exam skill: when they give you a bad-behavior scenario, ask which principle was violated. Sharing a client's private data points to principle five. A hidden conflict points to principle four. Sloppy analysis points to due care. Match the misconduct to the principle."
    },
    {
      "at": "Applying the Standards of Conduct",
      "say": "Next, the Standards of Conduct, which are how those principles get operationalized. There are six lettered sections, A through F, and the exam expects you to know what each covers and which duties live where."
    },
    {
      "at": "six components of the Standards of Conduct",
      "say": "Here is the map of the Standards of Conduct, organized into six sections. Section A is Duties Owed to Clients. Section B is Financial Planning and Application of the Practice Standards. Section C is the Practice Standards for the Financial Planning Process itself. Section D is Duties Owed to Firms and Subordinates. Section E is Duties Owed to CFP Board. And section F is the Prohibition on Circumvention. A quick way to hold it: A is your clients, D is your firm and the people under you, E is the Board, and F is the catch-all that says you cannot cheat around any of it. B and C are where financial planning and the seven-step process live. Do not confuse Duties Owed to Clients in A with Duties Owed to CFP Board in E, the exam likes to blur those two."
    },
    {
      "at": "Duties Owed to Clients",
      "say": "Section A, Duties Owed to Clients, is dense, so let me hit the highlights. First and biggest: the fiduciary duty, meaning at all times when providing financial advice you act as a fiduciary. Then integrity, competence, and diligence; disclosing and managing conflicts of interest; sound and objective professional judgment plus professionalism and complying with the law; confidentiality and privacy plus providing information to the client; duties when communicating with a client and when representing your compensation method; and duties when recommending or using other persons and technology. Now the exam trap that hides in here: a CFP professional must generally not borrow from or lend money to a client, and must not commingle a client's financial assets with their own or the firm's. There are narrow exceptions, like a lender in the ordinary course of business or a family member, but the default answer is no borrowing, no lending, no commingling."
    },
    {
      "at": "Practice Standards",
      "say": "When financial advice requires financial planning, you must follow the Practice Standards, the seven-step process, in order. Step one, understanding the client's personal and financial circumstances. Step two, identifying and selecting goals. Step three, analyzing the current course of action and potential alternatives. Step four, developing the recommendations. Step five, presenting the recommendations. Step six, implementing the recommendations. And step seven, monitoring progress and updating. A clean way to chant it: understand, set goals, analyze, develop, present, implement, then monitor and update. The exam loves to scramble the order or drop a step, so lock the sequence. Notice it starts with understanding the client and ends with ongoing monitoring, planning is a loop, not a one-time handoff."
    },
    {
      "at": "Duties Owed to CFP Board",
      "say": "Section E, Duties Owed to CFP Board. You must avoid any adverse conduct. You must report incidents involving adverse conduct to the CFP Board within thirty days. You must provide a narrative statement to the Board on reportable matters. You must cooperate with the Board throughout investigations and disciplinary proceedings. And you must comply with the Terms and Conditions of Certification and License. The number to memorize here is thirty days to report adverse conduct, that is a classic recall item and it shows up as a plain how-many-days question. Do not confuse this thirty-day reporting duty with any other timeline, thirty days, adverse conduct, to the Board."
    },
    {
      "at": "Duties to Firms",
      "say": "This slide covers section D and section F together. Section D, Duties to Firms and Subordinates, has two pieces: use reasonable care when supervising, meaning supervise the persons acting under your direction, and comply with the firm's lawful objectives, meaning follow the firm's lawful policies and directions. Then section F, the Prohibition on Circumvention, is the closing loophole: you may not do indirectly, or through another person, anything the Code and Standards prohibit you from doing directly. That is the rule that stops a planner from using a subordinate or a third party as a workaround. For exam prep, practice reading a planning scenario and spotting exactly where the planner violated the Code and Standards, the anonymous case histories on the CFP Board site show real conduct that led to sanctions."
    },
    {
      "at": "fiduciary duty & the three standards",
      "say": "Now we zoom into the fiduciary duty itself, and contrast it with suitability. This is one of the most tested areas in the whole module, because the exam gives you two plausible answers and asks which one is the fiduciary hallmark."
    },
    {
      "at": "Suitability vs. Fiduciary",
      "say": "Here is the contrast, memorize the two columns. Suitability is primarily rule-based and product-driven; fiduciary is primarily principle-based and solution-driven. Suitability disclosure is verbal; fiduciary disclosure is written. Suitability disputes go to arbitration; fiduciary disputes go to public courts. The suitability benchmark is a suitable recommendation based on risk profile, age, objectives, and time horizon; the fiduciary benchmark is aligning recommendations with the best interests of the client, considering all relevant factors. On who is held to each: suitability covers registered reps and agents, and those advising ERISA plans if the five-part test is met, while fiduciary covers RIAs, trustees, and individuals. And the regulators: suitability is FINRA and the states; fiduciary is the SEC, the states, and the DOL. The exam tell for fiduciary is the trio written disclosure, public courts, and best interests."
    },
    {
      "at": "The fiduciary duties",
      "say": "Now, here is a spot to be precise, because the deck flags a don't-confuse. Under the CFP Board, at all times when providing financial advice, you owe a fiduciary duty built on loyalty, care, and following the client's instructions. Kaplan teaches a broader list of six duties: the Duty of Loyalty, put the client's interests first and manage conflicts; the Duty of Care, act with care, skill, prudence, and diligence; the Duty to Disclose material facts and conflicts; the Duty to Diagnose, properly assess the situation; the Duty to Consult, seek outside expertise when needed; and the Duty to Keep Current, maintain up-to-date knowledge. But here is the exam-critical part: the CFP Board's actual fiduciary duty has three core components, the Duty of Loyalty, the Duty of Care, and the Duty to Follow Client Instructions. The six are Kaplan's teaching list; the three are the Board's. If the question asks for the CFP Board's fiduciary duty, answer loyalty, care, and follow client instructions."
    },
    {
      "at": "The Prudent Investor Rule",
      "say": "The Prudent Investor Rule is how fiduciary prudence gets applied to investing. Five ideas. First, prudence is judged on any investment as part of the total portfolio, not in isolation, so you do not condemn a single holding by itself, you look at the whole picture. Second, the trade-off between risk and return is the fiduciary's central consideration. Third, there are no categorical restrictions on the types of investments, as long as they are appropriate to the risk and return objectives of the trust, so nothing is banned outright. Fourth, prudent investing builds in the requirement that fiduciaries diversify. And fifth, delegation of trust investment and management functions is permitted, with appropriate safeguards. The theme is modern portfolio thinking: total portfolio, risk versus return, diversify, and you may delegate carefully."
    },
    {
      "at": "The Fitness Standards",
      "say": "Now we shift to the Fitness Standards, the character-and-fitness gate for certification. The key move here is sorting conduct into two buckets: the kind that always bars you, and the kind that bars you unless the DEC decides otherwise. Get the buckets straight and these questions are easy."
    },
    {
      "at": "Who the Fitness Standards apply to",
      "say": "First, who the Fitness Standards apply to. These are character-and-fitness standards for individuals seeking CFP certification, and there are two groups. Candidates, meaning individuals seeking initial CFP certification. And PER, which stands for Professionals Eligible for Reinstatement. So it is not just brand-new applicants, it also covers those coming back in. The big framework to carry into the next two slides: conduct gets sorted into Unacceptable Conduct, which always bars certification, and Presumptive Bar, which bars unless the DEC decides otherwise. Unacceptable equals permanent, no petition. Presumptive equals rebuttable, petition-eligible. Hold that split, because the exam tests exactly which conduct lands in which bucket."
    },
    {
      "at": "Unacceptable Conduct",
      "say": "Unacceptable Conduct always bars certification, and there is no petition, it is a permanent bar. What lands here? Felony conviction of theft, embezzlement, or other financially based crimes. Felony conviction of tax fraud or other tax-related crimes. Revocation of a financial professional license, that includes a securities rep, broker-dealer, insurance, accountant, investment adviser, or financial planner license, unless the revocation was merely administrative, like not renewing because you did not pay fees. Felony conviction of any degree of murder or rape. And felony conviction of any violent crime within the last five years. The exam trap to hold: Unacceptable Conduct is a permanent bar with no petition, so contrast it against the Presumptive Bar, which is petition-eligible. Notice the recency cue too, a violent crime within the last five years is unacceptable; that same crime more than five years ago moves down to presumptive."
    },
    {
      "at": "Presumptive Bar",
      "say": "The Presumptive Bar prevents certification unless the Disciplinary and Ethics Commission, the DEC, makes a different determination after review. So this bucket is rebuttable. What lands here? Two or more personal or business bankruptcies. Revocation or suspension of a nonfinancial professional license, like real estate or attorney, unless administrative. Suspension of a financial professional license, unless administrative. Felony conviction for nonviolent crimes, including perjury, within the last five years. And felony conviction of a violent crime other than murder or rape that occurred more than five years ago. Because it is presumptive, there is a petition path: the conduct is eligible for a petition for reconsideration, and the DEC may grant the petition, deny it, or deny it but allow the individual to re-apply. Two exam anchors: two or more bankruptcies is the signature presumptive item, and suspension of a license is presumptive while revocation of a financial license is unacceptable."
    },
    {
      "at": "Disciplinary",
      "say": "Finally, the disciplinary and appeals process, what happens once misconduct is alleged. Learn the cast of characters, the flow from investigation to sanction, and the specific requirements to get reinstated. The exam tests the parties and the exact reinstatement checklist."
    },
    {
      "at": "The Procedural Rules",
      "say": "The Procedural Rules lay out the disciplinary and appeals rules, processes, and policies, they are what let the CFP Board enforce when a professional commits wrongdoing. Know the five key parties. The Respondent is the CFP professional under investigation. Enforcement Counsel investigates and prosecutes the matter. The Hearing Panel hears the matter. The DEC, the Disciplinary and Ethics Commission, decides the sanctions. And the Appeals Committee reviews appeals of the DEC's decisions. A clean mental order: Enforcement Counsel brings it, the Hearing Panel hears it, the DEC decides the sanction, and the Appeals Committee reviews that decision. Do not mix up Enforcement Counsel, who prosecutes, with the DEC, who decides, the exam likes to swap those two roles."
    },
    {
      "at": "Investigations",
      "say": "Once a matter is investigated, if Enforcement Counsel finds probable cause, they take one of three actions. A Letter of Dismissal, meaning no further action. A Settlement Offer, resolving it by agreement. Or a Complaint, meaning the formal charge advances. And note, while proceedings are advancing, the CFP Board may issue an interim suspension. Then the DEC may impose sanctions, listed from least to most severe: Private Censure, then Public Censure, then Suspension, then Revocation, then Temporary Bar, and finally Permanent Bar. The tell is the escalation, a censure is the light end, and revocation and the bars are the heavy end. If a question asks the least severe sanction, it is a Private Censure; the most severe is a Permanent Bar."
    },
    {
      "at": "Petition for reinstatement",
      "say": "Here is the reinstatement checklist, and it hides one of the module's favorite traps. A Respondent's petition for reinstatement may not proceed unless the Respondent has done all of the following. Completed the suspension. Provided a properly-completed CFP Board Ethics Disclosure Questionnaire. Provided a written certification that they have read, understand, and will comply with the Code and Standards. Paid the reinstatement fee and any outstanding costs owed to the Board. And otherwise satisfied the Board's certification requirements. Now the trap, and know it cold: the requirement is an Ethics Disclosure Questionnaire, not a CFP Board verified Ethics CE course. The exam dangles the Ethics CE course as the tempting false option. So on an except question, the CE course is your answer, it is the item that is not a real requirement."
    }
  ];

  window.DECK_TEACH["fp511-m6-kaplan-slides.html"] = [
    {
      "at": "Supply, demand & the price mechanism",
      "say": "Alright, welcome to Module 6, the economic environment. This first objective builds the foundation for everything else: how prices actually get set. Get supply, demand, equilibrium, and elasticity straight here, and the policy and business-cycle material later will just click into place."
    },
    {
      "at": "Economics — the study of scarce choices",
      "say": "Okay, let's start with the big frame. Economics is the study of the production, distribution, and consumption of goods, which is really just a fancy way of saying: how do people make choices when resources are scarce. There are two altitudes to keep separate. Microeconomics is the close-up view, how individual people and companies decide to allocate their scarce resources, each prioritizing their own wants. Macroeconomics is the wide shot, the economy as a whole, like the factors that drive a whole country's economic growth. The tell on the exam is scope. If a question is about one firm or one household, that's micro. If it's about national growth, inflation, or unemployment across the country, that's macro."
    },
    {
      "at": "Supply & demand curves",
      "say": "Now the two curves that set every price. Supply is the amount of a good available for purchase at a given price. The higher the price a seller can get, the more they want to produce, so the supply curve slopes upward as you move left to right. Demand is the flip side, the quantity consumers actually want to buy at a given price. When price goes up, people buy less, so the demand curve slopes downward. Here's the distinction the exam loves to test: movement along the curve versus a shift of the whole curve. A change in price alone just moves you along the existing curve. A change in something other than price, like income or tastes, shifts the entire curve to a new position. Know that difference cold."
    },
    {
      "at": "Equilibrium — where the curves cross",
      "say": "Supply and demand are the two key determinants of price, and equilibrium is simply where those two curves cross. At that single intersection, the quantity buyers want to purchase exactly equals the quantity sellers want to supply. There's one price and one quantity where the market clears. And here's the important behavioral point: prices should always drift toward equilibrium on their own, unless something outside the market restricts them, like a price ceiling or a price floor. So if you see a price that isn't at equilibrium, expect it to move that direction. Above equilibrium there's a surplus that pushes price down, and below it there's a shortage that pushes price up."
    },
    {
      "at": "Price elasticity — how much quantity responds",
      "say": "Elasticity measures how much the quantity demanded responds when the price changes. Think of it as sensitivity. Inelastic demand belongs to necessities, things like food, medicine, and gasoline. When the price of a necessity rises, people barely cut back, because they still have to buy it, so quantity responds relatively little. Elastic demand belongs to luxuries, like a new automobile. When the price of a luxury goes up, it's easy to skip or delay, so quantity swings a lot. Here's the memory hook that keeps it straight: necessities are inelastic, because you buy them almost regardless of price. Luxuries are elastic, because they're easy to walk away from when prices climb."
    },
    {
      "at": "Gross Domestic Product (GDP)",
      "say": "Gross domestic product is the total monetary value of all goods and services produced within the domestic United States over a year. That word within is doing all the work. GDP is location-based, so it counts what's produced inside U.S. borders, and here's the trap: that includes income generated domestically by a foreign firm. A foreign-owned company operating on American soil counts in our GDP. GDP is measured in constant dollars, which gives you real GDP once you strip out inflation relative to a base or index year. So on the exam, if a question asks whether a foreign firm's U.S. output counts, the answer is yes, because GDP is about where production happens, not who owns the company."
    },
    {
      "at": "Monetary vs. fiscal policy",
      "say": "Okay, second objective, and this is one of the most heavily tested distinctions in the whole module: monetary policy versus fiscal policy. The key is to memorize who runs each one, because the exam constantly swaps them. Keep the players and the tools locked to the right side."
    },
    {
      "at": "Two levers, two different drivers",
      "say": "Two levers, two totally different drivers. Monetary policy is conducted by the Federal Reserve Board, the Fed. Its main move is raising or lowering short-term interest rates, because rates directly affect consumer spending and therefore demand. Fiscal policy is conducted by Congress and the current administration, meaning the president. It influences demand through governmental policies, which boils down to tax and spend. So here's the clean split to carry through the rest of this section: the Fed and interest rates is monetary, Congress plus the president and taxing and spending is fiscal. If a question mentions changing tax rates or the federal budget, that's fiscal. If it mentions reserve requirements or the discount rate, that's the Fed and monetary."
    },
    {
      "at": "The Fed's three monetary tools",
      "say": "The Fed's whole job here is controlling the overall money supply to steer future economic behavior, and it has three tools. First, reserve requirements, meaning it can lower or raise the reserves member banks are required to hold. Second, open-market operations, buying and selling government securities, and this is the one to flag, because it's the most frequently used tool. Third, the discount rate, raising or lowering the rate at which banks borrow from the Fed. Now connect open-market operations to the effect. When the Fed buys securities, it increases the money supply, drives interest rates down, and expands the economy. When it sells securities, it decreases the money supply, drives rates up, and contracts the economy. Buy expands, sell contracts, know it cold."
    },
    {
      "at": "The Fed & three key interest rates",
      "say": "This slide is a classic exam trap, because the Fed does not control all three of these rates. The discount rate is the rate banks pay to borrow directly from a Federal Reserve Bank, and this one the Fed directly controls. The federal funds rate is what banks charge each other on short-term borrowing, and here the Fed only sets a target and strongly influences it, it doesn't dictate it. The prime rate is what commercial banks charge their best customers, and the banks set that themselves, typically about three percentage points above the federal funds rate. So the trap is this: the Fed directly controls only the discount rate. It targets, but does not set, the federal funds rate, and it does not set the prime rate at all, the banks do."
    },
    {
      "at": "Congress's fiscal tools: tax & spend",
      "say": "Now flip to the fiscal side, Congress, and its two powers boil down to tax and spend. The power to tax matters because changing tax rates affects corporate earnings, consumers' disposable income, and workers' incentives to produce. The power to spend matters because changing government spending affects corporate earnings and consumer demand directly. Put it side by side with monetary so you can't confuse them. Fiscal policy: responsible party is Congress and the president, Congress passes the legislation and the president signs it, and the tools are changing tax laws, raising or cutting spending, and financing deficits with new government securities. Monetary policy: the responsible party is the Fed, which acts independently, and its tools are reserve requirements, the federal funds rate, the discount rate, and open-market operations."
    },
    {
      "at": "The business cycle & indicators",
      "say": "Alright, third objective, the business cycle and its indicators. The economy is always moving through phases, and the exam wants you to know what rises and falls in each one, plus how to tell leading, coincident, and lagging indicators apart. Let's walk the cycle."
    },
    {
      "at": "Business cycles — expansion & contraction",
      "say": "Business cycles are just the ups and downs of economic activity, and at any moment the economy is usually in one of two phases: expansion, when activity is growing, or contraction, when it's shrinking. There are two turning points to name. The peak is the top of an expansion, its maximum point. The trough is the bottom of a contraction, the low point. And a cycle always reverses itself once it hits a peak or a trough, so a peak rolls over into contraction and a trough turns back into expansion. For the exam, you don't need to predict the cycle, you just need to know what's happening within each phase, so keep the sequence in mind: expansion up to a peak, contraction down to a trough, then back up again."
    },
    {
      "at": "Expansion vs. contraction — what moves",
      "say": "Here's what actually moves in each phase, and there's a simple pattern with a twist. In an expansion, most things go up: income, demand, consumer sentiment, consumer credit, retail and auto sales, and mortgage debt and housing starts all rise. In a contraction, all of those fall. That's the easy part, most factors rise when the economy grows. Now the flip, and this is what the exam tests. Two things move opposite the crowd: inflation, including CPI, and unemployment. Those actually rise during a contraction and fall during an expansion. So the shortcut is: nearly everything rises in expansion, except inflation, CPI, and unemployment, which go the other way. Nail those three exceptions and you've got the whole table."
    },
    {
      "at": "Peak vs. trough — what moves",
      "say": "Now zoom in on the turning points themselves, approaching a peak versus a trough. Heading into a peak, most measures are running hot and rising: GDP, the producer price index, inflation, output and industrial production, and capacity utilization are all up. At the trough those are all down. But here's the trap, because two things do the opposite. Labor productivity and efficiency actually fall as you approach the peak. Why? The economy is running flat out, everyone's stretched, so each additional worker and hour produces less. Those two rise as you head toward the trough, when there's slack to work off. So remember: at the peak, productivity and efficiency go down, even though almost everything else is peaking up. That counterintuitive pair is exactly what they'll test."
    },
    {
      "at": "Recession vs. depression",
      "say": "This slide is pure number memorization, so just nail the figures. A recession is when real GDP falls for two consecutive quarters, which is a minimum of six months. A depression is when real GDP falls for six consecutive quarters, a minimum of eighteen months. Both are measured as a decline in real GDP from a baseline of zero. So the pairs to lock in are: recession is two quarters, six months, and depression is six quarters, eighteen months. Notice both use real GDP, the inflation-adjusted figure, not nominal. If a question gives you a stretch of declining GDP and asks what to call it, count the quarters: two gets you a recession, six gets you a depression."
    },
    {
      "at": "Three types of economic indicators",
      "say": "Economic indicators come in three flavors, and the exam's whole game here is not confusing them. Leading indicators precede the change, they move before the economy does, so they help you anticipate. Examples are housing starts, new claims for unemployment, bond yields, new orders for durable goods, and changes in investor sentiment. Coincident indicators move with the cycle, in real time, like industrial production, the level of personal income, and corporate profits. Lagging, or confirming, indicators change after the economy has already turned, so they confirm a move that already happened. Those include the prime interest rate, the change in CPI especially for services, business and consumer loans outstanding, and the average duration of unemployment. So the framework is simple: leading comes before, coincident moves with, and lagging confirms after."
    },
    {
      "at": "Inflation, deflation, disinflation & stagflation",
      "say": "Okay, fourth objective, the flavors of price-level change. Four terms that sound alike and get deliberately jumbled on the exam: inflation, deflation, disinflation, and stagflation. Let's pin down exactly what each one means so the distractors can't fool you."
    },
    {
      "at": "Four price-level conditions",
      "say": "Four terms, and the whole trick is keeping them straight. Inflation is a continued rise in the average level of prices, and the inflation rate is just the rate of change in that general price level. Deflation is the opposite, an actual decline in the general price level. Disinflation is the sneaky one: prices are still rising, but at a declining rate. So with disinflation the inflation rate is going down even though prices themselves are still going up. And stagflation is a combination of stagnation and inflation. Here's the classic confusion the exam sets up: disinflation is not deflation. With disinflation prices still rise, just more slowly. Deflation is prices actually falling. If you only remember one distinction from this slide, make it that one."
    },
    {
      "at": "Inflation & deflation — the effects",
      "say": "Now the real-world effects of the two big ones. With inflation, each dollar buys fewer goods, so it raises the cost of homes, durables, and everyday consumption. If inflation outpaces wage growth, people lose purchasing power, and this hits retirees on fixed incomes the hardest, because their income doesn't climb with prices. That fixed-income detail is a favorite exam point. Deflation is a decline in the general price level, often driven by a shrinking money supply and falling consumer demand. Picture a surplus of goods and a shortage of cash. Buying power actually rises at first, which sounds good, but it's outweighed by rising unemployment and falling production as businesses cut back. So deflation isn't the happy mirror image of inflation, it comes bundled with real economic pain."
    },
    {
      "at": "Stagflation — the 1970s special case",
      "say": "Stagflation is stagnation plus inflation, and it's the ugly combination the economy isn't supposed to be able to produce. It happens when inflation and unemployment rise together while overall growth is slow and business output is falling. Normally rising inflation goes with a hot, growing economy, so having high inflation and high unemployment at the same time is the anomaly. The textbook case is the 1970s, when rapidly rising oil prices made consumer prices jump sharply and forced businesses to cut back production, driving up unemployment at the same time. Here's the test tip: focus on the typical causes and effects of inflation, disinflation, and deflation, and don't overanalyze. For the CFP exam, just reason from what typically should happen, and stagflation's tell is inflation and unemployment climbing together."
    },
    {
      "at": "Bankruptcy & the 2005 Act",
      "say": "Alright, fifth objective, bankruptcy. You need the three chapters straight, which assets are protected, and what the 2005 Act changed. This is very testable and mostly memorization, so let's be precise about who files what and what survives creditors."
    },
    {
      "at": "The three bankruptcy chapters",
      "say": "Three chapters, and each has a distinct job. Chapter 13 is for individuals with regular income. It's an adjustment of debts, meaning payments get restructured, sometimes reduced, to be manageable, and the key point is the debtor generally keeps their assets. Chapter 7 is individual liquidation. Personal unsecured debts are generally canceled, and note that the 2005 Act significantly restricted its availability. Chapter 11 is reorganization for individuals, businesses, and corporate debtors. Anyone eligible for Chapter 7 is eligible, the debtors remain in possession and keep operating, and the exceptions to remember are stockbrokers, commodities brokers, and railroads. So the quick contrast is: Chapter 13 reorganize and keep assets, Chapter 7 liquidate and cancel unsecured debt, Chapter 11 business reorganization where the debtor stays in control."
    },
    {
      "at": "Chapter 7 — protected assets (exemptions)",
      "say": "In a Chapter 7, certain assets are exempt, meaning creditors can't reach them, and this is a favorite exam topic. On the state-law side, the exemptions include the homestead exemption, a limited amount of personal property, pension and retirement plan rights under ERISA plans, the existing cash value of life insurance, proceeds of annuity contracts, disability income benefits, and property held as tenants by the entirety. On the federal side, you've got Federal Civil Service retirement benefits, railroad pensions, and veterans' benefits. Now the flip side, what's generally NOT dischargeable, because they love this: student and government loans, except for an undue-hardship exception, child support and alimony, and recent federal income taxes due. Those debts follow you out of bankruptcy, they don't get wiped away."
    },
    {
      "at": "Bankruptcy Abuse Prevention & Consumer Protection Act of 2005",
      "say": "The 2005 Act, formally the Bankruptcy Abuse Prevention and Consumer Protection Act, tightened the rules, and here's what changed. Individuals who have the ability to pay, as defined in the Act, must file under Chapter 13 instead of getting their debts canceled under Chapter 7, so you can't just liquidate if you can actually afford to repay. Consumer Chapter 7 use got limited to liquidating credit-card bills or loans not secured by a house or other asset. Chapter 7 filers must have their debt situation analyzed for eligibility and complete a credit counseling program before approval. And lenders now have to warn consumers about the dangers of paying only minimum balances on credit cards. One number to know: the asset protection was initially set at one million dollars in 2005, and it's adjusted every three years."
    },
    {
      "at": "Consumer credit protection laws",
      "say": "Last objective, the consumer credit protection laws. This is an alphabet soup of acts, and the exam tests whether you can match each law to what it actually does, plus a handful of key numbers and deadlines. Let's get the names exactly right and pin the timelines."
    },
    {
      "at": "Consumer Credit Protection Act (Truth in Lending)",
      "say": "Start with the Consumer Credit Protection Act, better known as Truth in Lending. Before extending credit, a lender has to disclose three things: the dollar amount of the finance charges, the annual percentage rate, the APR, and the other loan terms and conditions. The whole point is that borrowers can see the true cost of credit and compare offers on an apples-to-apples basis. There's one number to memorize here: if your credit card is lost or stolen, your maximum liability is fifty dollars per card, less any amount already charged. So fifty dollars is the cap on what a consumer can be held responsible for on a lost or stolen card, and that fifty-dollar figure is a very common exam plug."
    },
    {
      "at": "The credit-reporting statutes",
      "say": "Now the credit-reporting statutes, and you want to match each name to its function. The Fair Credit Reporting Act: if you're denied credit, you must be told which agency supplied the information, and you then have thirty days to request a free copy of your credit file. The Fair Credit Billing Act governs billing errors, and its timeline matters: you must notify the creditor in writing within sixty days, the creditor has thirty days to respond and ninety days to resolve. The Consumer Credit Reporting Reform Act requires reports to be accurate, relevant, and recent, restricts access to bona fide users, and requires that denied applicants be told why. The Equal Credit Opportunity Act prohibits credit discrimination. And the Fair Debt Collection Practices Act bars abusive collector tactics, though courts can still garnish wages for a legal judgment."
    },
    {
      "at": "How long info stays in a credit file",
      "say": "This slide is all about the clocks, so just lock in the numbers. Under the Fair Credit Reporting Act, adverse information stays on your file for up to seven years. Bankruptcy information stays longer, up to ten years. And after a credit denial, you have a thirty-day window to request a free copy of your credit file. Then there's the billing-error clock under the Fair Credit Billing Act, and it runs sixty, thirty, ninety: the consumer notifies within sixty days, the creditor responds within thirty days, and it's resolved within ninety days. So the four figures to carry into the exam are seven years for adverse info, ten years for bankruptcy, thirty days to request the free file, and the sixty-thirty-ninety billing-error sequence."
    },
    {
      "at": "Identity theft — FACTA & common scams",
      "say": "Finally, identity theft, anchored by the Fair and Accurate Credit Transaction Act of 2003, FACTA. Three things it does: it lets consumers get a free credit report every twelve months from each of the three national credit-reporting agencies, it lets individuals place alerts on their file if they suspect identity theft or are deploying overseas in the military, and it requires that consumer information be disposed of safely and securely. Then know two common scams by name. Phishing is pretending to be a financial institution and sending spam or pop-ups to trick you into handing over personal information. Skimming is stealing credit or debit card data with a special storage device while the card is being processed. Phishing fools the person, skimming steals off the card, keep those two straight."
    }
  ];

  window.DECK_TEACH["fp511-m7-kaplan-slides.html"] = [
    {
      "at": "Calculate the education funding goal",
      "say": "Alright, welcome to Module 7, Education Planning. We open with the calculation that anchors the whole module: how much does a family actually need to fund a child's education? Get the shape of this problem in your head now, because every education funding question is a variation on it."
    },
    {
      "at": "three-move education funding calculation",
      "say": "Okay, here's the frame that makes education funding easy. Every lump-sum problem follows the same three moves: inflate, adjust, invest. Move one, inflate: take today's tuition and grow it forward to the first year of college, solving for future value. Move two, adjust: size the lump sum you'd need at the start of college to cover all the college years, solving for present value in BEGIN mode, because tuition is due at the start of each year. Move three, invest: discount that lump sum all the way back to today, solving for present value again, to see what you must set aside now. Inflate the cost forward, size the pile you need at college, then bring it home to today. Learn those three moves and the numbers just fall into place."
    },
    {
      "at": "Wayne & Mark",
      "say": "Let's work it with Wayne and Mark. Mark is four, college starts at eighteen, so that's fourteen years out, for a four-year program. Tuition today is twenty-five thousand dollars, college inflation six percent, and the money earns eight percent. Step one, inflate: twenty-five thousand as present value, fourteen N, six percent, gives a future value of about fifty-six thousand five hundred twenty-three, that's the first year's tuition. Step two, adjust: use the inflation-adjusted rate. Take one-point-oh-eight divided by one-point-oh-six, minus one, times one hundred, and you get roughly one-point-eight-nine as your interest rate. Run four N with that payment in BEGIN mode and the present value at the start of college is about two hundred nineteen thousand eight hundred eighty-seven. Step three, invest: discount that back fourteen years at eight percent. Wayne must invest about seventy-four thousand eight hundred sixty-three today. And know why we use the inflation-adjusted rate: it puts the growing tuition stream and the growing investment on the same footing."
    },
    {
      "at": "Estimating the Student Aid Index",
      "say": "Now, objective two: the Student Aid Index, or SAI. This is the number the financial-aid system uses to decide what a family is expected to contribute. We'll cover what changed from the old system, what drives the number, and how asset placement can quietly help or hurt a family."
    },
    {
      "at": "FAFSA and the move from EFC to SAI",
      "say": "Start with the form and the name change. The FAFSA, the Free Application for Federal Student Aid, is the common form a family completes to be considered for financial aid. Here's the update the exam wants: the old Expected Family Contribution, the EFC, has transitioned to the Student Aid Index, the SAI. The calculation itself is similar to the old EFC math, so don't overthink it. Three key changes to lock in: Pell Grant eligibility expanded, the FAFSA was simplified, and, this is the tested one, the number of siblings in college no longer reduces the SAI. Under the old rules, more kids in college at once lowered the contribution. That break is gone."
    },
    {
      "at": "What drives the SAI",
      "say": "So what actually drives the SAI? Two sources, income and assets, split between parents and student. On the parent side, income is counted at twenty-two to forty-seven percent of modified adjusted gross income above the income protection allowance, and assets at five to five-point-six-four percent of included assets, but note home value and retirement accounts are excluded. On the student side, income is counted at fifty percent above the protected amount, and that protected amount is eleven thousand five hundred ten dollars, while student assets, like bank, brokerage, CDs, and UGMA or UTMA accounts, are counted at twenty percent. Here's the trap: a dollar in the student's name is assessed at twenty percent, but that same dollar as a parent asset is hit at only five to five-point-six-four percent. And one more, parent-owned 529 distributions are not counted as income in the SAI."
    },
    {
      "at": "asset-assessment gap, visualized",
      "say": "This slide just drives that gap home visually, and it's worth pausing on because it's classic exam material. Parent-owned assets are added to the SAI at up to five-point-six-four percent. Student-owned assets are added at twenty percent. That means a student asset hurts aid eligibility roughly three-and-a-half times more than the same money held as a parent asset. The planning takeaway writes itself: where you title education money matters. Keep it in the parent's name, or in a parent-owned 529, and you shrink the SAI, which means more potential aid. Put it in the student's name and you inflate the number that reduces aid."
    },
    {
      "at": "estimating a financial-aid package",
      "say": "Let's estimate an aid package. Total annual college cost is sixty-five thousand dollars. Parent assets are included at the maximum five-point-six-four percent, and the student-income protected amount is eleven thousand five hundred ten. The inputs: parent income one hundred fifty thousand, counted at twenty-two percent; parent assets one hundred seventy-five thousand; student income twelve thousand two hundred; student assets thirty thousand. Step one, parent income: twenty-two percent of one hundred fifty thousand is thirty-three thousand. Step two, parent assets: five-point-six-four percent of one hundred seventy-five thousand is nine thousand eight hundred seventy. Step three, student income above the protected amount: twelve thousand two hundred minus eleven thousand five hundred ten is six hundred ninety. Step four, student assets: twenty percent of thirty thousand is six thousand. Sum them: that's forty-nine thousand five hundred sixty, the SAI. Subtract from the sixty-five thousand cost and you get about fifteen thousand four hundred forty in estimated aid. Remember what the SAI is: the family's expected contribution. The aid package just fills the gap, so a lower SAI means more potential aid."
    },
    {
      "at": "Financial-aid eligibility & federal grants",
      "say": "Next, objective three, federal grants and who qualifies for them. The theme here is need-based aid: money you don't repay, tied to the FAFSA and to a checklist of eligibility rules. Know which programs are grants and what the exam counts as need-based."
    },
    {
      "at": "Federal grants (need-based",
      "say": "Here are the federal grants, and the common thread is that they are need-based and require the FAFSA. First, Federal Pell Grants, the core need-based grant, with eligibility expanded under the FAFSA changes. Second, FSEOG, the Federal Supplemental Educational Opportunity Grants. Third, TEACH Grants, Teacher Education Assistance for College and Higher Education. And fourth, Iraq and Afghanistan Service Grants, for eligible surviving family of service members. Now don't tunnel-vision on federal money, because aid also comes from colleges themselves, from nonprofits, from state governments, and from private organizations. But when a question says need-based federal grant requiring the FAFSA, these four are your universe."
    },
    {
      "at": "Federal grant eligibility",
      "say": "This is the eligibility checklist for federal grants, and the exam likes to test the individual conditions. To qualify, a student must be a citizen or eligible noncitizen with a valid Social Security number. They must hold a high school diploma or GED, or complete approved homeschooling. They must be enrolled as a regular student in an eligible degree or certificate program, and maintain satisfactory academic progress. They must not owe a refund on a federal grant or be in default on a federal loan. They must be registered with Selective Service if required. And they cannot have a drug conviction for an offense committed while receiving federal student aid. And here's the tell the questions lean on: an unsubsidized Stafford loan is not need-based, so it never belongs in a list of need-based, FAFSA-required grants, even though it does use the FAFSA."
    },
    {
      "at": "Building the funding strategy",
      "say": "Objective four is about pulling the full funding strategy together, and the piece we highlight is federal loans. When savings and grants don't cover the bill, loans and other resources fill the gap. Know the loan types and how they differ on need."
    },
    {
      "at": "Federally funded loans",
      "say": "Federally funded loans come in a few flavors, and the key distinction is subsidized versus unsubsidized. A subsidized Stafford loan is need-based, and the government pays the interest while the student is in school. An unsubsidized Stafford loan is not need-based, and interest accrues from the moment it's disbursed. That subsidized-versus-unsubsidized split is the tested one. Then there are PLUS loans, which are Parent Loans to Undergraduate Students, and Direct Consolidation loans, which combine multiple federal loans into one. And to round out the whole plan, you layer in scholarships, college work study, and education tax credits, which we cover later, to cut the out-of-pocket cost efficiently."
    },
    {
      "at": "Will the savings plan get there",
      "say": "Objective five flips the question. Instead of asking how big a lump sum you need, it asks whether a set monthly savings amount will actually get the family there. This adds a fourth move, compare, and it's a favorite exam format. Let's work the numbers."
    },
    {
      "at": "Keaton family's 529",
      "say": "Meet the Keatons. They put three hundred seventy-five dollars a month into a 529 for newborn Annie. Tuition today is fifteen thousand a year, education inflation five-point-two-five percent, the 529 earns eight percent, and college begins at eighteen for five years. Will three hundred seventy-five a month be enough? It's inflate, adjust, invest, compare. Step one, the future cost of the first year, in END mode, one payment per year: fifteen thousand present value, five-point-two-five percent, eighteen N, gives a future value of about thirty-seven thousand six hundred seventy-eight. Step two, the balance needed to fund all five years, in BEGIN mode: that thirty-seven thousand as the payment, with the inflation-adjusted rate of about two-point-six-one, five N, gives a present value of about one hundred seventy-nine thousand thirty-eight. Step three, the future value of the three hundred seventy-five monthly payments, END mode, twelve payments per year, eighteen times twelve is two hundred sixteen N, giving about one hundred eighty thousand thirty-two. Step four, compare: one hundred eighty thousand thirty-two minus one hundred seventy-nine thousand thirty-eight is a surplus of about nine hundred ninety-four fifty. The plan works. And watch the modes, because that's the classic error: step one is END, step two switches to BEGIN because tuition is due at the start of each year, and step three is END with two hundred sixteen periods."
    },
    {
      "at": "Comparing education savings vehicles",
      "say": "Objective six is the vehicle comparison, and honestly this is the heart of the module for exam points. We line up the 529, the Coverdell, and the UGMA or UTMA account. Learn the dollar limits and the side-by-side differences and you'll pick these apart on sight."
    },
    {
      "at": "Key numbers at a glance",
      "say": "Three numbers to memorize cold before we hit the table. First, two thousand dollars, the maximum annual Coverdell, or CESA, contribution per beneficiary, and that's across all donors combined, not per donor. Second, ten thousand dollars, the annual 529 limit for K-through-12 tuition, meaning elementary and secondary school. And third, one hundred ninety thousand dollars, the accelerated five-year 529 gift a couple can make gift-tax-free in 2025. Those three figures anchor most of the vehicle questions, so make them automatic."
    },
    {
      "at": "529 vs. Coverdell vs. UGMA",
      "say": "Here's the comparison grid, and let me pull out what separates these. On contribution limit, the 529 is high and gift-tax driven with the five-year acceleration allowed, the Coverdell is capped at two thousand a year per beneficiary across all donors, and the UGMA or UTMA has no statutory limit since it's just a gift to the minor. None of the three is federally tax deductible. The 529 and Coverdell both grow tax-deferred with tax-free qualified withdrawals, but the UGMA or UTMA does not, and the kiddie tax may apply. All three can cover K-through-12 and college. The big one for aid: a 529 and a Coverdell count as parent assets at five to five-point-six-four percent, but a UGMA or UTMA is a student asset at twenty percent. And on control and portability, the 529 owner keeps control and can change the beneficiary, the Coverdell is portable too, but the UGMA or UTMA is an irrevocable gift, not portable. One tip from the grid: a Coverdell and a 529 can be used simultaneously for the same beneficiary."
    },
    {
      "at": "Portability & control at the age of majority",
      "say": "Let's isolate portability and control, because this is where the exam sets its trap. Say Student A no longer needs the money. Can you retitle it for Student B? For 529s and Coverdells, yes, the beneficiary can generally be changed, they're portable. For a UGMA or UTMA, no, it's an irrevocable gift to the child, and it can't be moved to another student. Trusts follow their own terms, things like 2503(b), 2503(c), or spendthrift provisions. And here's the control trap: with a UGMA or UTMA, the child assumes control at the age of majority, typically eighteen or twenty-one, even if education is no longer the goal. The 529 owner, by contrast, keeps control throughout. So custodial accounts hand the keys to the kid; 529s never do."
    },
    {
      "at": "Gift-tax & planning implications",
      "say": "Objective seven zooms out to the gift-tax and estate angle on 529s, plus a quick reminder of why time is your biggest ally. These are the planning implications that turn a savings account into a wealth-transfer tool."
    },
    {
      "at": "Gift-tax rules and 529s",
      "say": "Here's how 529 gifting works. Contributions are completed gifts, so they can use the annual gift-tax exclusion. The special feature is the accelerated, or five-year, contribution, and you'll hear it called ratable, superfunding, or five-year gift-tax averaging. It lets you front-load five years of exclusions at once. A couple combining their five-year accelerated contributions can deposit one hundred ninety thousand dollars in 2025 with no gift tax. And there's a nice estate-tax twist: the account generally leaves the donor's estate for estate-tax purposes even though the donor keeps control of it, which is unusual and worth remembering. So the two numbers on this slide are the five-year averaging window and that one hundred ninety thousand couple's figure."
    },
    {
      "at": "Why starting now matters",
      "say": "This one's short but it's the why behind all the math. Three forces drive the funding problem. First, the persistent education inflation rate, costs just keep climbing year after year. Second, the persistence of time, meaning compounding rewards an early start, the earlier you fund, the harder your money works. And third, changing the N value, that is, the number of years you save: more years of savings dramatically lowers the required monthly deposit. That last point is the planner's lever. When a client can't afford the monthly number, the most powerful fix is usually to start earlier and stretch N, not to chase a higher return."
    },
    {
      "at": "Education tax credits — AOTC & LLC",
      "say": "Objective eight, the education tax credits. Two of them, the American Opportunity Tax Credit and the Lifetime Learning Credit, and the exam loves to confuse them. We'll get the numbers exact and then nail the differences that decide the answer."
    },
    {
      "at": "two credits at a glance",
      "say": "Meet the two credits by their headline numbers. The American Opportunity Tax Credit is worth up to two thousand five hundred dollars per student, calculated as one hundred percent of the first two thousand of expenses plus twenty-five percent of the next two thousand. Up to forty percent of the AOTC can be refundable, meaning you can get money back even with no tax owed. The Lifetime Learning Credit maxes at two thousand dollars, calculated as twenty percent of the first ten thousand of expenses. Here's the distinction that decides questions: the AOTC is claimed per student, so each eligible child gets their own, while the LLC is a single per-family, per-return credit no matter how many students you have."
    },
    {
      "at": "AOTC vs. Lifetime Learning Credit",
      "say": "Let's put the two credits head to head. Maximum: AOTC up to two thousand five hundred per student, LLC up to two thousand per return. Years available: the AOTC covers only the first four years of postsecondary education, while the LLC is available for all years, unlimited, which makes it the one for graduate school or job-skills courses. Degree: the AOTC requires pursuing an undergraduate degree or credential, the LLC has no degree requirement. Enrollment: the AOTC needs at least half-time, the LLC allows even one course, any status. Refundability: the AOTC is up to forty percent refundable, the LLC is nonrefundable. And a felony drug conviction disqualifies the student for the AOTC, but that rule doesn't apply to the LLC. Two watch-outs: both credits phase out at eighty to ninety thousand for singles and one hundred sixty to one hundred eighty thousand for married filing jointly, and no double-dipping, the same expense can't fund two benefits. One case tip: with three kids in college, you could claim the AOTC for each child and one LLC for the whole family."
    },
    {
      "at": "Employer education assistance",
      "say": "Last objective, nine, employer-provided education assistance under Internal Revenue Code Section 127. This is a clean, high-value benefit with one number and one trap. Let's cover the rule and then work a quick example on what qualifies."
    },
    {
      "at": "IRC Section 127 educational assistance",
      "say": "Section 127 is the employer educational assistance program, and it's a favorite because the rules are simple. Is the benefit taxed to the employee? No, it's excluded from income. The annual limit is five thousand two hundred fifty dollars. Qualifying expenses are tuition, books, supplies, equipment, and required enrollment fees. And which education qualifies? All undergraduate and graduate, which is broader than you might expect. There's no income phaseout, so even highly paid employees get the full exclusion. So the number to know cold is five thousand two hundred fifty dollars a year, excludable from income under Section 127."
    },
    {
      "at": "Jane's reimbursement",
      "say": "Let's test the qualifying-expense rule with Jane. She's a paraplanner taking night classes in music composition, and her employer reimburses under Section 127. Which of her costs qualify? Enrollment fees of two hundred fifty, tuition of three thousand, books of two hundred fifty, a computer lab fee of fifty, and a keyboard lab fee of twenty-five, those all qualify, because they're tuition, fees, books, supplies, and required equipment. Add them up: two hundred fifty plus three thousand plus two hundred fifty plus fifty plus twenty-five is three thousand five hundred seventy-five. Now the one that doesn't count: school apparel of one hundred seventy-five dollars. That's a personal item, not an educational expense, so it's excluded. The trap is exactly that, personal items like clothing don't qualify even when the coursework itself clearly does. Jane's qualifying reimbursement is three thousand five hundred seventy-five dollars. And that closes out Module 7, Education Planning, from the three-move funding calculation through the SAI, the savings vehicles, the gift-tax angle, the credits, and Section 127. Nice work."
    }
  ];

})();
