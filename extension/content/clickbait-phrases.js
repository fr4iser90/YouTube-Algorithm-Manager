// Common clickbait phrases and patterns in English and German
window.clickbaitPhrases = {
  // English clickbait patterns
  english: {
    // Curiosity gaps
    curiosity: [
      'you won\'t believe',
      'what happens next',
      'the reason why',
      'the truth about',
      'what they don\'t want you to know',
      'what nobody tells you',
      'the secret to',
      'what I discovered',
      'what I found out',
      'what I learned',
      'what I realized',
      'what changed my life',
      'what changed everything',
      'what changed the game',
      'what changed the industry'
    ],

    // Urgency/Scarcity
    urgency: [
      'never seen before',
      'exclusive',
      'limited time',
      'last chance',
      'don\'t miss out',
      'going viral',
      'trending now',
      'breaking news',
      'just released',
      'just dropped',
      'just announced',
      'just revealed',
      'just discovered',
      'just found',
      'just happened'
    ],

    // Shock/Controversy
    shock: [
      'shocking',
      'controversial',
      'scandalous',
      'outrageous',
      'unbelievable',
      'mind-blowing',
      'jaw-dropping',
      'insane',
      'crazy',
      'wild',
      'unexpected',
      'surprising',
      'stunning',
      'amazing',
      'incredible'
    ],

    // Numbers and Lists
    numbers: [
      'top 10',
      '10 things',
      '5 ways',
      '7 reasons',
      '3 secrets',
      'one simple trick',
      'one weird trick',
      'one easy way',
      'one simple way',
      'one quick tip',
      'one small change',
      'one big mistake',
      'one common mistake',
      'one important thing',
      'one crucial step'
    ],

    // Questions
    questions: [
      'do you know',
      'did you know',
      'have you ever',
      'are you ready',
      'can you guess',
      'can you believe',
      'can you imagine',
      'what if I told you',
      'what would you do if',
      'what would happen if',
      'what would you say if',
      'what would you think if',
      'what would you do when',
      'what would you do after',
      'what would you do before'
    ]
  },

  // German clickbait patterns
  german: {
    // Curiosity gaps
    curiosity: [
      'du wirst es nicht glauben',
      'was als nächstes passiert',
      'der grund warum',
      'die wahrheit über',
      'was sie dir nicht sagen wollen',
      'was dir niemand erzählt',
      'das geheimnis von',
      'was ich entdeckt habe',
      'was ich herausgefunden habe',
      'was ich gelernt habe',
      'was ich erkannt habe',
      'was mein leben verändert hat',
      'was alles verändert hat',
      'was das spiel verändert hat',
      'was die branche verändert hat'
    ],

    // Urgency/Scarcity
    urgency: [
      'noch nie gesehen',
      'exklusiv',
      'nur für kurze zeit',
      'letzte chance',
      'nicht verpassen',
      'geht gerade viral',
      'trending jetzt',
      'breaking news',
      'gerade veröffentlicht',
      'gerade erschienen',
      'gerade angekündigt',
      'gerade enthüllt',
      'gerade entdeckt',
      'gerade gefunden',
      'gerade passiert'
    ],

    // Shock/Controversy
    shock: [
      'schockierend',
      'kontrovers',
      'skandalös',
      'empörend',
      'unglaublich',
      'umwerfend',
      'atemberaubend',
      'verrückt',
      'wild',
      'unerwartet',
      'überraschend',
      'faszinierend',
      'erstaunlich',
      'unglaublich',
      'fantastisch'
    ],

    // Numbers and Lists
    numbers: [
      'top 10',
      '10 dinge',
      '5 wege',
      '7 gründe',
      '3 geheimnisse',
      'ein einfacher trick',
      'ein seltsamer trick',
      'ein einfacher weg',
      'ein schneller tipp',
      'eine kleine änderung',
      'ein großer fehler',
      'ein häufiger fehler',
      'eine wichtige sache',
      'ein entscheidender schritt',
      'ein wichtiger schritt'
    ],

    // Questions
    questions: [
      'weißt du',
      'wusstest du',
      'hast du jemals',
      'bist du bereit',
      'kannst du erraten',
      'kannst du es glauben',
      'kannst du dir vorstellen',
      'was wenn ich dir sage',
      'was würdest du tun wenn',
      'was würde passieren wenn',
      'was würdest du sagen wenn',
      'was würdest du denken wenn',
      'was würdest du tun wenn',
      'was würdest du danach tun',
      'was würdest du davor tun'
    ]
  },

  // Common patterns that might indicate clickbait
  patterns: {
    // Title patterns
    titlePatterns: [
      /^[0-9]+\s+(ways|things|reasons|secrets|tips|tricks|steps|ideas|hacks|facts)/i,
      /^(the|this|these|those)\s+[0-9]+\s+(ways|things|reasons|secrets|tips|tricks|steps|ideas|hacks|facts)/i,
      /^(how|why|what|when|where|who)\s+(to|do|is|are|was|were|will|would|should|could|can|may|might)/i,
      /^(you|your|yours|you\'re|you\'ll|you\'ve|you\'d)\s+(won\'t|can\'t|shouldn\'t|mustn\'t|needn\'t|don\'t|didn\'t|haven\'t|hasn\'t|hadn\'t)/i,
      /^(never|always|every|all|none|no|any|some|many|few|most|least|best|worst|first|last|only|just|even|still|yet|already|ever|never|once|twice|thrice)/i
    ],

    // Thumbnail patterns
    thumbnailPatterns: [
      'red circle',
      'arrow pointing',
      'shocked face',
      'surprised expression',
      'exaggerated reaction',
      'bright colors',
      'bold text',
      'multiple exclamation marks',
      'question marks',
      'emojis'
    ]
  }
};
