import type { PlanetKey, SefirahId } from './kabbalah';

export interface PracticalPlanetGuide {
  plainTitle: string;
  coreQuality: string;
  bestHourFor: string;
  avoidInHour: string;
  lifeLesson: string;
}

export const PLANET_PRACTICAL_GUIDE: Record<PlanetKey, PracticalPlanetGuide> = {
  Sun: {
    plainTitle: 'The Sun (Chamah) — Clarity, Vitality & Heart',
    coreQuality: 'Centering, warmth, leadership, and authentic self-expression.',
    bestHourFor:
      'Making big decisions, stepping into leadership, creative visioning, and connecting with your core purpose.',
    avoidInHour: 'Pride, ego clashes, or forcing your will onto others.',
    lifeLesson:
      'Like the Sun at the center of the Tree of Life (Tiferet), true strength comes from harmonizing opposites with warmth and generosity.',
  },
  Moon: {
    plainTitle: 'The Moon (Levanah) — Intuition, Rhythm & Receptivity',
    coreQuality: 'Reflection, emotional awareness, adaptability, and home.',
    bestHourFor:
      'Journaling, family connection, listening deeply, rest, and noticing subtle emotional patterns.',
    avoidInHour: 'Over-reacting to passing moods or making rigid long-term vows.',
    lifeLesson:
      'The Moon teaches that you do not always have to generate light from scratch—sometimes your power is in quieting down so you can reflect higher wisdom.',
  },
  Mercury: {
    plainTitle: 'Mercury (Kokhav) — Mind, Language & Skill',
    coreQuality: 'Communication, learning, analysis, and sacred craft.',
    bestHourFor:
      'Writing, coding, studying, negotiating, organizing plans, and difficult conversations.',
    avoidInHour: 'Overthinking, gossip, or scattering your attention across too many tabs.',
    lifeLesson:
      'Words create worlds (Sefer Yetzirah). When your speech and thought are precise, your inner and outer life align.',
  },
  Venus: {
    plainTitle: 'Venus (Nogah) — Harmony, Art & Relationships',
    coreQuality: 'Beauty, affection, peace-making, and rhythmic endurance.',
    bestHourFor:
      'Reconciling with loved ones, creating art or music, enjoying nature, and cultivating gratitude.',
    avoidInHour: 'Indulgence, people-pleasing, or avoiding necessary truth.',
    lifeLesson:
      'Beauty is not superficial decoration—it is the visible sign that diverse parts have found harmony.',
  },
  Mars: {
    plainTitle: 'Mars (Ma’adim) — Courage, Boundaries & Focus',
    coreQuality: 'Strength (Gevurah), discipline, protection, and cutting away clutter.',
    bestHourFor:
      'Tackling hard workouts or feared tasks, setting healthy boundaries, and breaking bad habits.',
    avoidInHour: 'Arguments, impulsive anger, or harsh judgment of yourself and others.',
    lifeLesson:
      'In Kabbalah, Gevurah (Strength) is what gives love a container. Without boundaries, energy dissipates; with wise focus, it becomes a laser.',
  },
  Jupiter: {
    plainTitle: 'Jupiter (Tzedek) — Expansion, Grace & Wisdom',
    coreQuality: 'Loving-kindness (Chesed), abundance, optimism, and mentorship.',
    bestHourFor:
      'Philanthropy, teaching, long-term financial or life planning, asking for favors, and forgiveness.',
    avoidInHour: 'Over-promising or taking on more than you can sustain.',
    lifeLesson:
      'True abundance flows when you become a wider channel—giving and receiving without fear of scarcity.',
  },
  Saturn: {
    plainTitle: 'Saturn (Shabbetai) — Deep Structure, Patience & Sacred Rest',
    coreQuality: 'Contemplation (Binah), mastery over time, legacy, and stillness.',
    bestHourFor:
      'Deep meditation, long-term architecture, honoring commitments, decluttering, and Shabbat-like rest.',
    avoidInHour: 'Rushing quick fixes, pessimism, or harsh self-criticism.',
    lifeLesson:
      'Limitation is the mother of form. Saturn teaches patience: the deepest trees grow slowly.',
  },
};

export interface PracticalSefirahGuide {
  everydayName: string;
  humanQuestion: string;
  howToPractice: string;
}

export const SEFIRAH_PRACTICAL_GUIDE: Record<SefirahId, PracticalSefirahGuide> = {
  keter: {
    everydayName: 'Pure Intention & Purpose',
    humanQuestion: 'What is my deepest "Why" beneath all my daily goals?',
    howToPractice:
      'Pause before starting a new project or day to reconnect with your highest intention before jumping into action.',
  },
  chokhmah: {
    everydayName: 'The Flash of Insight',
    humanQuestion: 'What new possibility appears when I let go of preconceptions?',
    howToPractice:
      'Practice beginner’s mind—listen and observe without immediately labeling or judging.',
  },
  binah: {
    everydayName: 'Deep Understanding & Structure',
    humanQuestion: 'How can I turn a raw spark of inspiration into a living system?',
    howToPractice:
      'Give your ideas structure, patience, and a timeline so they can actually grow in the real world.',
  },
  chesed: {
    everydayName: 'Unconditional Kindness & Expansion',
    humanQuestion: 'Where can I bring more generosity, warmth, and openness today?',
    howToPractice:
      'Perform one act of generosity with zero expectation of return; expand your circle of care.',
  },
  gevurah: {
    everydayName: 'Healthy Boundaries & Discipline',
    humanQuestion: 'What do I need to say "No" to so my "Yes" has real power?',
    howToPractice:
      'Cut away one distraction or obligation that drains your vitality; Channel your energy with precision.',
  },
  tiferet: {
    everydayName: 'Compassionate Balance (The Heart)',
    humanQuestion: 'How do I balance kindness with truth, and giving with boundaries?',
    howToPractice:
      'Stand in the center when life pulls you to extremes; harmonize discipline with empathy.',
  },
  netzach: {
    everydayName: 'Perseverance & Creative Rhythm',
    humanQuestion: 'What worthy goal requires my steady, joyful persistence?',
    howToPractice:
      'Keep showing up to your craft or habit even when initial excitement fades.',
  },
  hod: {
    everydayName: 'Humility, Gratitude & Clear Craft',
    humanQuestion: 'Are my words, plans, and daily details aligned with my values?',
    howToPractice:
      'Refine your communication, express sincere gratitude, and honor the details.',
  },
  yesod: {
    everydayName: 'Authentic Connection & Channeling',
    humanQuestion: 'How do I bridge my inner ideals with my actual relationships?',
    howToPractice:
      'Be fully present and trustworthy with the people in front of you; channel inspiration into real bond.',
  },
  malkhut: {
    everydayName: 'Embodied Presence in the Here & Now',
    humanQuestion: 'How is wisdom showing up in my physical actions, body, and environment?',
    howToPractice:
      'Ground your spirituality in tangible action—complete the task, care for your space, and honor the present moment.',
  },
};

export function getLunarPracticalAdvice(phaseAngle: number): {
  stageTitle: string;
  plainExplanation: string;
  howToBenefit: string;
} {
  if (phaseAngle < 20 || phaseAngle >= 340) {
    return {
      stageTitle: 'New Moon Seed Point (Rosh Chodesh / Molad)',
      plainExplanation:
        'The Moon sits between Earth and the Sun, appearing dark as it resets for a brand-new 29.5-day cycle. In Kabbalah, emptiness is the prerequisite for receiving new light.',
      howToBenefit:
        'Set your core intention for the coming month. Clear mental clutter, forgive the past month’s missteps, and plant one clear seed you want to grow over the next two weeks.',
    };
  }
  if (phaseAngle < 160) {
    return {
      stageTitle: 'Waxing Moon — Building & Gathering Light',
      plainExplanation:
        'Every night the Moon grows brighter as it opens to receive more of the Sun’s light (Tiferet illuminating Malkhut).',
      howToBenefit:
        'This is the upward, constructive half of the month. Launch initiatives, reach out to collaborators, build habits, and take visible outward action while momentum is naturally rising.',
    };
  }
  if (phaseAngle <= 200) {
    return {
      stageTitle: 'Full Moon (15th of the Month) — Peak Illumination',
      plainExplanation:
        'On the 15th of the Hebrew month, the Sun and Moon stand directly face-to-face (Panim-be-Panim) with nothing blocking their light. Major festivals like Passover and Sukkot are anchored here.',
      howToBenefit:
        'Celebrate progress, gather with community, and harvest insights. What you planted at the New Moon is now fully illuminated—notice what is flourishing.',
    };
  }
  return {
    stageTitle: 'Waning Moon — Integration, Distillation & Release',
    plainExplanation:
      'Having received full illumination on the 15th, the Moon now gradually narrows—not as a loss, but to digest and internalize the light into roots and wisdom.',
    howToBenefit:
      'Shift from starting new things to finishing, editing, organizing, and resting. In the final days before the next New Moon, release what no longer serves you.',
  };
}

