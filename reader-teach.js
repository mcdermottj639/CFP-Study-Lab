/* Reader "Teach mode" narration — the teacher's script.
 *
 * This is the CONTENT for the 👩‍🏫 Teach button that reader-tts.js adds. Where the
 * 🎙️ Podcast button reads the page text VERBATIM, Teach mode speaks these
 * conversational, plain-English explanations — a teacher walking you through the
 * material — while the reader auto-scrolls to (and expands) the section being
 * taught. Same offline OS voice; different WORDS.
 *
 * Shape: window.READER_TEACH[<reader file name>][<tab data-tab>] = [ {at, say}, … ]
 *   at  — a substring matched (case-insensitive) against a section header
 *         (.collapsible-header / .ch / h1-h4) in that tab's panel. The player
 *         scrolls to + highlights + expands that section while it speaks. Falls
 *         back to the panel top if not found / omitted.
 *   say — the teaching narration. reader-tts.js splits it into sentence-length
 *         utterances at playback (so it highlights smoothly and dodges the iOS
 *         long-utterance cut-off).
 *
 * Grounded strictly in the reader's own (textbook-verified) content — per the
 * CLAUDE.md standing rule, the audited reader is a faithful textbook distillation
 * and fine to ground teaching narration from. Add a tab/course here, no engine
 * change. Precached in sw.js; injected before reader-tts.js.
 *
 * STATUS: pilot — FP512 » Insurance Principles authored first so the style can be
 * heard before rolling out to the rest of FP511 + FP512. */
(function () {
  'use strict';
  window.READER_TEACH = window.READER_TEACH || {};

  window.READER_TEACH['fp512-reading.html'] = {
    principles: [
      {
        at: 'Risk Terminology',
        say: "Alright, this is Insurance Principles — the foundation the whole course builds on, so let's take it slow. " +
          "Start with the vocabulary, because the exam loves to test how these three words relate. " +
          "Risk is the possibility of loss. A peril is the actual cause of a loss — fire, wind, theft. " +
          "And a hazard is any condition that makes a loss more likely or more severe. " +
          "The classic chain they give you: oily rags in the corner are the hazard, they raise the chance of a fire, which is the peril, and the fire damages your home, which is the risk. " +
          "Now hazards come in three flavors, and this is a favorite trap. " +
          "A physical hazard is a tangible condition — the oily rags, an icy sidewalk, a wood-frame house. " +
          "A moral hazard is dishonesty or outright intent — someone committing arson to collect the insurance. " +
          "A morale hazard, spelled with an e, is just carelessness because insurance exists — leaving the car unlocked with the keys in it, because hey, it's covered. " +
          "Here's the memory hook: mor-al is about action and intent; mor-ale is about a bad attitude. Same misspelling, opposite mindsets. " +
          "Finally, lock in the risk categories. Pure risk — loss or no loss — is the only kind that's insurable. " +
          "Speculative risk, where you could gain or lose like a stock bet, is not. " +
          "And fundamental risks that hit huge groups, like a recession or a pandemic, are generally not insurable, while particular risks that affect just one person, like your house fire, are."
      },
      {
        at: 'Insurable Risk Requirements',
        say: "So what actually makes a risk insurable? Look at it from the insurance company's point of view. " +
          "First, they need a large pool of similar exposures — that's the law of large numbers, and it's what lets actuaries predict losses accurately. " +
          "Second, the loss has to be definite and measurable — you can pin down the time, the place, and the amount. " +
          "Third, it should be fortuitous, meaning accidental. And here's the exam's favorite exception: life insurance. " +
          "Death is certain, so how is it insurable? Because while the event is certain, the timing is not — and that uncertainty is what they insure. " +
          "Fourth, no single loss can be catastrophic to the insurer, which is why they spread exposure geographically. " +
          "Now, insurable interest — this is a timing trap they test constantly, so slow down here. " +
          "For life insurance, you only need insurable interest at the moment the policy is issued, not when the claim is paid. " +
          "For property, you need it at both issuance and at the time of loss — you have to still own the thing when it burns. " +
          "Two more terms to bank: Actual Cash Value is replacement cost minus depreciation. " +
          "And subrogation — the insurer's right to go after the at-fault party after paying you — applies to property and health, but never to life or disability, because those are valued contracts, not indemnity contracts. " +
          "That's exactly why you can collect a life policy and still sue the person who caused the death."
      },
      {
        at: 'Insurance Producers',
        say: "This section is all about who represents whom, and that one distinction drives the liability. " +
          "An agent represents the insurer — the company. A broker represents the insured — the client. " +
          "That single fact answers a lot of questions. " +
          "Because the agent represents the company, the agent's knowledge and actions are imputed to the insurer — if the agent messes up within their scope, the company is on the hook. " +
          "A broker, by contrast, has none of that authority and can't bind the insurer. " +
          "Now, agents carry three kinds of authority, and you want all three cold. " +
          "Express authority is what's spelled out in writing in their agency contract. " +
          "Implied authority is what's reasonably necessary to do the job even if it isn't written down — like collecting premiums or delivering policies. " +
          "And apparent authority is the tricky one: if the insurer's own words or actions make it look like the agent has authority, the company can be bound even when the agent actually overstepped. " +
          "One more term — ratification — is when the insurer accepts a premium knowing the agent did something unauthorized, which binds the company to that act going forward."
      },
      {
        at: 'Tort Law',
        say: "Liability insurance exists because of tort law, so let's build it up piece by piece. " +
          "A tort is a civil wrong that causes harm — physical, emotional, or financial — and the wrongdoer is called the tortfeasor. " +
          "Most liability coverage is about unintentional torts, which means negligence. " +
          "To prove negligence, all four elements have to be present: a duty owed to the plaintiff, a breach of that duty, actual damages, and proximate cause — an unbroken chain linking the breach to the harm. " +
          "Miss even one, and there is no negligence. " +
          "A few special doctrines to recognize: attractive nuisance, where something like an unfenced pool draws in children and the owner has to secure it; " +
          "negligence per se, where a statute sets the duty of care; " +
          "and absolute, or strict, liability, where you're responsible for damages even without any fault — think blasting or keeping wild animals. " +
          "Remember, liability and fault are not the same thing. " +
          "On defenses, know the big contrast: contributory negligence is the strictest — any fault by the plaintiff, even one percent, bars all recovery — versus comparative negligence, the modern standard, which just reduces the award by the plaintiff's percentage of fault. " +
          "And on damages: special damages are the hard economic losses like medical bills and lost wages; general damages are the softer ones like pain and suffering; and punitive damages punish truly reckless or malicious conduct. " +
          "Here's the trap they love: punitive damages are generally not insurable, because public policy won't let a wrongdoer pass their punishment on to an insurer."
      },
      {
        at: 'Underwriting',
        say: "Underwriting is simply the process of deciding whether to accept a risk, and on what terms. " +
          "Agents do what's called field underwriting — the initial screening — and insurers price policies using mortality tables for the probability of death and morbidity tables for the probability of sickness. " +
          "The enemy underwriting fights is adverse selection: the people most likely to have a loss are the ones most eager to buy coverage, so waiting periods, exclusions, and underwriting itself keep that in check. " +
          "A few claim-side terms to know: salvage is the insurer's right to take damaged property after paying a full claim, like a totaled car. " +
          "Abandonment is the flip side — you can't just dump wrecked property on the insurer and demand full value. " +
          "And the collateral source rule means damages aren't reduced just because the plaintiff got paid from somewhere else, like their own health insurance. " +
          "When it comes to picking an insurer, separate two decisions. " +
          "You choose the agent based on the person — their competence, their service, their reputation. " +
          "You choose the company based on financial strength, its ability to actually pay claims, which the independent raters measure: A.M. Best, Moody's, S and P, and Fitch. " +
          "Note that the NAIC does not rate companies. " +
          "And know the ownership structures: a mutual insurer is owned by its policyowners and returns profits to them as dividends on participating policies, while a stock insurer is owned by shareholders and typically issues nonparticipating policies."
      },
      {
        at: 'Regulation of the Insurance',
        say: "Last piece: who regulates all of this? " +
          "The key fact the exam wants is that insurance is primarily regulated at the state level, not the federal level — each state has its own insurance commissioner and department. " +
          "Three branches play a role: the legislature writes the insurance laws, the state insurance department enforces them and handles licensing, and the courts interpret them. " +
          "The NAIC — the National Association of Insurance Commissioners — coordinates across states and writes model laws for them to adopt, but it has no direct regulatory power of its own, and, as we just said, it does not assign financial-strength ratings. " +
          "Keep that straight and the regulation questions turn into easy points. " +
          "That's Insurance Principles end to end — the language of risk, what makes something insurable, who represents whom, the tort rules behind liability coverage, how underwriting and insurer selection work, and who's in charge. Everything else in the course leans on this."
      }
    ]
  };
})();
