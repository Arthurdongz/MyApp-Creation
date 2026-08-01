// 366 scripture verses on hope, encouragement, comfort, joy, peace, and strength —
// one for every day of the year, including a leap day, with no repeats.
//
// Each entry carries the same reference in four public-domain translations:
// the King James Version (KJV, 1611/1769), the World English Bible (WEB,
// modern plain English), the American Standard Version (ASV, 1901, a close
// formal revision of the KJV), and Young's Literal Translation (YLT, 1862/
// 1898, deliberately literal/quirky). Picked over NLT/MSG/TPT/TLB, which
// are commercially copyrighted (Tyndale, NavPress, Broadstreet) and can't
// be reproduced here without a license. Settings let a user either
// alternate between the versions day to day, or pin a single favorite
// version for every verse.
//
// Text is compiled from training knowledge in an offline environment with
// no live Bible-database access to verify against (attempted and blocked
// by this environment's network policy) — treat this as a good-faith first
// draft, not a certified-accurate transcription. A handful of verses have
// genuine textual variants between translations (e.g. Job 13:15, where ASV
// and WEB follow a different Hebrew reading than KJV) — those are
// deliberate, not errors. Two pre-existing errors in the original KJV-only
// version of this file were caught and corrected in an earlier pass:
// Proverbs 12:25 had non-KJV wording, and the entry labeled "2 John 1:6"
// actually contained 1 Peter 1:8's text (fixed to the real, and correctly
// attributed, 2 John 1:3). Spot-check before relying on this beyond
// personal devotional use.

const BIBLE_VERSIONS = [
  { id: "KJV", name: "King James Version" },
  { id: "WEB", name: "World English Bible" },
  { id: "ASV", name: "American Standard Version" },
  { id: "YLT", name: "Young's Literal Translation" },
];

const VERSES = [
  {
    ref: "Genesis 1:3",
    versions: {
      KJV: "And God said, Let there be light: and there was light.",
      WEB: "God said, \"Let there be light,\" and there was light.",
      ASV: "And God said, Let there be light: and there was light.",
      YLT: "and God saith, 'Let light be;' and light is.",
    },
  },
  {
    ref: "Genesis 1:27",
    versions: {
      KJV: "So God created man in his own image, in the image of God created he him.",
      WEB: "God created man in his own image. In God's image he created him;",
      ASV: "And God created man in his own image, in the image of God created he him;",
      YLT: "And God prepareth the man in His image; in the image of God He prepared him,",
    },
  },
  {
    ref: "Genesis 50:20",
    versions: {
      KJV: "But as for you, ye thought evil against me; but God meant it unto good.",
      WEB: "As for you, you meant evil against me, but God meant it for good,",
      ASV: "As for you, ye meant evil against me; but God meant it for good,",
      YLT: "and ye, ye devised against me evil -- God devised it for good,",
    },
  },
  {
    ref: "Exodus 14:14",
    versions: {
      KJV: "The LORD shall fight for you, and ye shall hold your peace.",
      WEB: "Yahweh will fight for you, and you shall be still.",
      ASV: "Jehovah will fight for you, and ye shall hold your peace.",
      YLT: "Jehovah doth fight for you, and ye keep silent.",
    },
  },
  {
    ref: "Exodus 15:2",
    versions: {
      KJV: "The LORD is my strength and song, and he is become my salvation.",
      WEB: "Yah is my strength and song. He has become my salvation.",
      ASV: "Jehovah is my strength and song, And he is become my salvation:",
      YLT: "My strength and song is Jah, and He is to me for salvation:",
    },
  },
  {
    ref: "Deuteronomy 31:8",
    versions: {
      KJV: "And the LORD, he it is that doth go before thee; he will be with thee, he will not fail thee, neither forsake thee: fear not, neither be dismayed.",
      WEB: "Yahweh himself is who goes before you. He will be with you. He will not fail you nor forsake you. Don't be afraid. Don't be discouraged.",
      ASV: "And Jehovah, he it is that doth go before thee; he will be with thee, he will not fail thee, neither forsake thee: fear not, neither be dismayed.",
      YLT: "and Jehovah, He is the goer before thee, He himself is with thee; He doth not fail thee, nor forsake thee; fear not, nor be affrighted.",
    },
  },
  {
    ref: "Numbers 6:24-26",
    versions: {
      KJV: "The LORD bless thee, and keep thee: the LORD make his face shine upon thee, and be gracious unto thee: the LORD lift up his countenance upon thee, and give thee peace.",
      WEB: "Yahweh bless you, and keep you. Yahweh make his face to shine on you, and be gracious to you. Yahweh lift up his face toward you, and give you peace.",
      ASV: "Jehovah bless thee, and keep thee: Jehovah make his face to shine upon thee, and be gracious unto thee: Jehovah lift up his countenance upon thee, and give thee peace.",
      YLT: "Jehovah bless thee, and keep thee; Jehovah cause His face to shine upon thee, and favour thee; Jehovah lift up His countenance upon thee, and appoint for thee -- peace.",
    },
  },
  {
    ref: "Deuteronomy 31:6",
    versions: {
      KJV: "Be strong and of a good courage, fear not, nor be afraid of them: for the LORD thy God, he it is that doth go with thee.",
      WEB: "Be strong and courageous. Don't be afraid or scared of them, for Yahweh your God himself is who goes with you.",
      ASV: "Be strong and of good courage, fear not, nor be affrighted at them: for Jehovah thy God, he it is that doth go with thee;",
      YLT: "be strong and courageous, fear not, nor be terrified, because of them, for Jehovah thy God, He it is who is going with thee;",
    },
  },
  {
    ref: "Deuteronomy 33:27",
    versions: {
      KJV: "The eternal God is thy refuge, and underneath are the everlasting arms.",
      WEB: "The eternal God is your dwelling place. Underneath are the everlasting arms.",
      ASV: "The eternal God is thy dwelling-place, And underneath are the everlasting arms.",
      YLT: "a habitation of the eternal God, and beneath, arms age-during;",
    },
  },
  {
    ref: "Deuteronomy 30:15",
    versions: {
      KJV: "See, I have set before thee this day life and good, and death and evil.",
      WEB: "Behold, I have set before you today life and good, and death and evil.",
      ASV: "See, I have set before thee this day life and good, and death and evil;",
      YLT: "See, I have set before thee to-day life and good, and death and evil,",
    },
  },
  {
    ref: "Joshua 1:9",
    versions: {
      KJV: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      WEB: "Haven't I commanded you? Be strong and courageous. Don't be afraid. Don't be dismayed, for Yahweh your God is with you wherever you go.",
      ASV: "Have not I commanded thee? Be strong and of good courage; be not affrighted, neither be thou dismayed: for Jehovah thy God is with thee whithersoever thou goest.",
      YLT: "Have not I commanded thee? be strong and courageous; be not terrified, nor be affrighted; for with thee is Jehovah thy God whithersoever thou goest.",
    },
  },
  {
    ref: "Joshua 1:5",
    versions: {
      KJV: "There shall not any man be able to stand before thee all the days of thy life.",
      WEB: "No man will be able to stand before you all the days of your life.",
      ASV: "There shall not any man be able to stand before thee all the days of thy life.",
      YLT: "no man doth station himself before thee all days of thy life;",
    },
  },
  {
    ref: "Joshua 24:15",
    versions: {
      KJV: "Choose you this day whom ye will serve... but as for me and my house, we will serve the LORD.",
      WEB: "Choose today whom you will serve... but as for me and my house, we will serve Yahweh.",
      ASV: "choose you this day whom ye will serve... but as for me and my house, we will serve Jehovah.",
      YLT: "choose for you to-day whom ye do serve... and I and my house -- we serve Jehovah.",
    },
  },
  {
    ref: "Judges 6:12",
    versions: {
      KJV: "The LORD is with thee, thou mighty man of valour.",
      WEB: "Yahweh is with you, you mighty man of valor.",
      ASV: "Jehovah is with thee, thou mighty man of valor.",
      YLT: "Jehovah is with thee, O mighty one of valour.",
    },
  },
  {
    ref: "Ruth 1:16",
    versions: {
      KJV: "Whither thou goest, I will go... thy people shall be my people, and thy God my God.",
      WEB: "Where you go, I will go... your people will be my people, and your God my God.",
      ASV: "for whither thou goest, I will go... and thy people shall be my people, and thy God my God",
      YLT: "for whither thou goest I go, and where thou lodgest I lodge; thy people is my people, and thy God my God.",
    },
  },
  {
    ref: "1 Samuel 3:9",
    versions: {
      KJV: "Speak, LORD; for thy servant heareth.",
      WEB: "Speak, Yahweh; for your servant hears.",
      ASV: "Speak, Jehovah; for thy servant heareth.",
      YLT: "Speak, Jehovah, for Thy servant heareth.",
    },
  },
  {
    ref: "1 Samuel 16:7",
    versions: {
      KJV: "The LORD looketh on the heart.",
      WEB: "Yahweh looks at the heart.",
      ASV: "Jehovah looketh on the heart.",
      YLT: "Jehovah looketh on the heart.",
    },
  },
  {
    ref: "Psalm 119:105",
    versions: {
      KJV: "Thy word is a lamp unto my feet, and a light unto my path.",
      WEB: "Your word is a lamp to my feet, and a light for my path.",
      ASV: "Thy word is a lamp unto my feet, And light unto my path.",
      YLT: "A lamp to my foot is Thy word, and a light to my path.",
    },
  },
  {
    ref: "1 Kings 19:12",
    versions: {
      KJV: "And after the fire a still small voice.",
      WEB: "After the fire, a still small voice.",
      ASV: "and after the fire a still small voice.",
      YLT: "and after the fire a voice, a small, calm one.",
    },
  },
  {
    ref: "Nehemiah 8:10",
    versions: {
      KJV: "The joy of the LORD is your strength.",
      WEB: "The joy of Yahweh is your strength.",
      ASV: "for the joy of Jehovah is your strength.",
      YLT: "for the joy of Jehovah is your strength.",
    },
  },
  {
    ref: "1 Chronicles 28:20",
    versions: {
      KJV: "Be strong and of good courage, dread not, nor be dismayed: for the LORD God, even my God, will be with thee.",
      WEB: "Be strong and courageous, and do it. Don't be afraid, nor be dismayed; for Yahweh God, even my God, is with you.",
      ASV: "Be strong and of good courage, and do it: fear not, nor be dismayed; for Jehovah God, even my God, is with thee;",
      YLT: "be strong, and do it, fear not, nor be affrighted, for Jehovah God, my God, is with thee;",
    },
  },
  {
    ref: "2 Chronicles 7:14",
    versions: {
      KJV: "If my people, which are called by my name, shall humble themselves, and pray, and seek my face... then will I hear from heaven, and will forgive their sin, and will heal their land.",
      WEB: "If my people, who are called by my name, will humble themselves, pray, and seek my face... then I will hear from heaven, forgive their sin, and heal their land.",
      ASV: "and if my people, who are called by my name, shall humble themselves, and pray, and seek my face... then will I hear from heaven, and will forgive their sin, and will heal their land.",
      YLT: "and My people, on whom My name is called, are humbled, and pray, and seek My face... then I hear from the heavens, and forgive their sin, and heal their land.",
    },
  },
  {
    ref: "2 Chronicles 20:15",
    versions: {
      KJV: "The battle is not yours, but God's.",
      WEB: "The battle is not yours, but God's.",
      ASV: "for the battle is not yours, but God's.",
      YLT: "for not for you is the battle, but for God.",
    },
  },
  {
    ref: "Ezra 8:22",
    versions: {
      KJV: "The hand of our God is upon all them for good that seek him.",
      WEB: "The hand of our God is on all those who seek him, for good.",
      ASV: "The hand of our God is upon all them that seek him, for good;",
      YLT: "the hand of our God is upon all seeking Him for good;",
    },
  },
  {
    ref: "Esther 4:14",
    versions: {
      KJV: "And who knoweth whether thou art come to the kingdom for such a time as this?",
      WEB: "Who knows whether you haven't come to the kingdom for such a time as this?",
      ASV: "and who knoweth whether thou art not come to the kingdom for such a time as this?",
      YLT: "and who knoweth whether for a time like this thou hast come to the kingdom?",
    },
  },
  {
    ref: "Job 19:25",
    versions: {
      KJV: "For I know that my redeemer liveth, and that he shall stand at the latter day upon the earth.",
      WEB: "But as for me, I know that my Redeemer lives. In the end, he will stand upon the earth.",
      ASV: "But I know that my Redeemer liveth, And at last he will stand up upon the earth:",
      YLT: "that I -- I have known my Redeemer, and the latter one on the dust doth rise;",
    },
  },
  {
    ref: "Job 38:4",
    versions: {
      KJV: "Where wast thou when I laid the foundations of the earth?",
      WEB: "Where were you when I laid the foundations of the earth?",
      ASV: "Where wast thou when I laid the foundations of the earth? Declare, if thou hast understanding.",
      YLT: "Where wast thou when I founded earth? declare, if thou hast known understanding.",
    },
  },
  {
    ref: "Job 42:5",
    versions: {
      KJV: "I have heard of thee by the hearing of the ear: but now mine eye seeth thee.",
      WEB: "I had heard of you by the hearing of the ear, but now my eye sees you.",
      ASV: "I had heard of thee by the hearing of the ear; But now mine eye seeth thee:",
      YLT: "By the hearing of the ear I heard Thee, and now mine eye hath seen Thee,",
    },
  },
  {
    ref: "Job 13:15",
    versions: {
      KJV: "Though he slay me, yet will I trust in him.",
      WEB: "Behold, he will kill me. I have no hope. Nevertheless, I will maintain my ways before him.",
      ASV: "Behold, he will slay me; I have no hope: Nevertheless I will maintain my ways before him.",
      YLT: "Lo, He doth slay me -- I wait not! Only, my ways unto His face I argue.",
    },
  },
  {
    ref: "Job 14:1",
    versions: {
      KJV: "Man that is born of a woman is of few days, and full of trouble.",
      WEB: "Man who is born of a woman is of few days, and full of trouble.",
      ASV: "Man, that is born of a woman, Is of few days, and full of trouble.",
      YLT: "Man, born of a woman, Is few of days, and satisfied with trouble.",
    },
  },
  {
    ref: "Psalm 23:1",
    versions: {
      KJV: "The LORD is my shepherd; I shall not want.",
      WEB: "Yahweh is my shepherd; I shall lack nothing.",
      ASV: "Jehovah is my shepherd; I shall not want.",
      YLT: "Jehovah is my shepherd, I do not want.",
    },
  },
  {
    ref: "Psalm 23:3",
    versions: {
      KJV: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
      WEB: "He restores my soul. He guides me in the paths of righteousness for his name's sake.",
      ASV: "He restoreth my soul: He guideth me in the paths of righteousness for his name's sake.",
      YLT: "My soul He refresheth, He leadeth me in paths of righteousness, For His name's sake.",
    },
  },
  {
    ref: "Psalm 23:4",
    versions: {
      KJV: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me.",
      WEB: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.",
      ASV: "Yea, though I walk through the valley of the shadow of death, I will fear no evil; for thou art with me:",
      YLT: "Yea, though I walk in a valley of death-shade, I fear no evil, for Thou art with me,",
    },
  },
  {
    ref: "Psalm 23:6",
    versions: {
      KJV: "Surely goodness and mercy shall follow me all the days of my life.",
      WEB: "Surely goodness and loving kindness shall follow me all the days of my life.",
      ASV: "Surely goodness and lovingkindness shall follow me all the days of my life;",
      YLT: "Only -- goodness and kindness pursue me, all days of my life,",
    },
  },
  {
    ref: "Psalm 30:5",
    versions: {
      KJV: "Weeping may endure for a night, but joy cometh in the morning.",
      WEB: "Weeping may stay for the night, but joy comes in the morning.",
      ASV: "Weeping may tarry for the night, But joy cometh in the morning.",
      YLT: "In the evening lodge doth weeping, And at morning -- singing.",
    },
  },
  {
    ref: "Psalm 30:11",
    versions: {
      KJV: "Thou hast turned for me my mourning into dancing.",
      WEB: "You have turned my mourning into dancing for me.",
      ASV: "Thou hast turned for me my mourning into dancing;",
      YLT: "Thou hast turned my mourning to dancing to me,",
    },
  },
  {
    ref: "Psalm 31:24",
    versions: {
      KJV: "Be of good courage, and he shall strengthen thine heart, all ye that hope in the LORD.",
      WEB: "Be strong, and let your heart take courage, all you who hope in Yahweh.",
      ASV: "Be strong, and let your heart take courage, All ye that hope in Jehovah.",
      YLT: "Strengthen yourselves, and He doth strengthen your heart, All ye who are waiting for Jehovah!",
    },
  },
  {
    ref: "Psalm 34:18",
    versions: {
      KJV: "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.",
      WEB: "Yahweh is near to those who have a broken heart, and saves those who have a crushed spirit.",
      ASV: "Jehovah is nigh unto them that are of a broken heart, And saveth such as are of a contrite spirit.",
      YLT: "Near is Jehovah to the broken of heart, And the bruised of spirit He saveth.",
    },
  },
  {
    ref: "Psalm 34:8",
    versions: {
      KJV: "O taste and see that the LORD is good: blessed is the man that trusteth in him.",
      WEB: "Oh taste and see that Yahweh is good. Blessed is the man who takes refuge in him.",
      ASV: "Oh taste and see that Jehovah is good: Blessed is the man that taketh refuge in him.",
      YLT: "Taste ye and see that Jehovah is good, O the happiness of the man who trusteth in Him.",
    },
  },
  {
    ref: "Psalm 34:6",
    versions: {
      KJV: "This poor man cried, and the LORD heard him, and saved him out of all his troubles.",
      WEB: "This poor man cried, and Yahweh heard him, and saved him out of all his troubles.",
      ASV: "This poor man cried, and Jehovah heard him, And saved him out of all his troubles.",
      YLT: "This poor one called, and Jehovah heard, And from all his distresses saved him.",
    },
  },
  {
    ref: "Psalm 37:4",
    versions: {
      KJV: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.",
      WEB: "Also delight yourself in Yahweh, and he will give you the desires of your heart.",
      ASV: "Delight thyself also in Jehovah; And he will give thee the desires of thy heart.",
      YLT: "And delight thyself on Jehovah, And He giveth to thee the petitions of thy heart.",
    },
  },
  {
    ref: "Psalm 37:7",
    versions: {
      KJV: "Rest in the LORD, and wait patiently for him.",
      WEB: "Rest in Yahweh, and wait patiently for him.",
      ASV: "Rest in Jehovah, and wait patiently for him:",
      YLT: "Be silent for Jehovah, and stay thyself for Him,",
    },
  },
  {
    ref: "Psalm 37:25",
    versions: {
      KJV: "I have been young, and now am old; yet have I not seen the righteous forsaken.",
      WEB: "I have been young, and now am old, yet I have not seen the righteous forsaken.",
      ASV: "I have been young, and now am old; Yet have I not seen the righteous forsaken,",
      YLT: "Young I have been, I have also become old, And I have not seen the righteous forsaken,",
    },
  },
  {
    ref: "Psalm 46:1",
    versions: {
      KJV: "God is our refuge and strength, a very present help in trouble.",
      WEB: "God is our refuge and strength, a very present help in trouble.",
      ASV: "God is our refuge and strength, A very present help in trouble.",
      YLT: "God is to us a refuge and strength, A help in adversities found most surely.",
    },
  },
  {
    ref: "Psalm 46:10",
    versions: {
      KJV: "Be still, and know that I am God.",
      WEB: "Be still, and know that I am God.",
      ASV: "Be still, and know that I am God:",
      YLT: "Desist, and know that I am God,",
    },
  },
  {
    ref: "Psalm 51:10",
    versions: {
      KJV: "Create in me a clean heart, O God; and renew a right spirit within me.",
      WEB: "Create in me a clean heart, O God. Renew a right spirit within me.",
      ASV: "Create in me a clean heart, O God; And renew a right spirit within me.",
      YLT: "A clean heart create for me, O God, And a stedfast spirit renew within me.",
    },
  },
  {
    ref: "Psalm 55:22",
    versions: {
      KJV: "Cast thy burden upon the LORD, and he shall sustain thee.",
      WEB: "Cast your burden on Yahweh, and he will sustain you.",
      ASV: "Cast thy burden upon Jehovah, and he will sustain thee:",
      YLT: "Cast on Jehovah that which He hath given thee, And He doth sustain thee,",
    },
  },
  {
    ref: "Psalm 56:3",
    versions: {
      KJV: "What time I am afraid, I will trust in thee.",
      WEB: "When I am afraid, I will put my trust in you.",
      ASV: "What time I am afraid, I will put my trust in thee.",
      YLT: "The day I am afraid, I am confident toward Thee.",
    },
  },
  {
    ref: "Psalm 56:8",
    versions: {
      KJV: "Thou tellest my wanderings: put thou my tears into thy bottle.",
      WEB: "You number my wanderings. You put my tears into your bottle.",
      ASV: "Thou numberest my wanderings: Put thou my tears into thy bottle;",
      YLT: "My wandering Thou hast counted, Thou placest my tear in Thy bottle,",
    },
  },
  {
    ref: "Psalm 62:5",
    versions: {
      KJV: "My soul, wait thou only upon God; for my expectation is from him.",
      WEB: "My soul, wait in silence for God alone, for my expectation is from him.",
      ASV: "My soul, wait thou in silence for God only; For my expectation is from him.",
      YLT: "Only -- for God, be silent, O my soul, For from Him is my hope.",
    },
  },
  {
    ref: "Psalm 94:19",
    versions: {
      KJV: "In the multitude of my thoughts within me thy comforts delight my soul.",
      WEB: "In the multitude of my thoughts within me, your comforts delight my soul.",
      ASV: "In the multitude of my thoughts within me Thy comforts delight my soul.",
      YLT: "In the abundance of my thoughts within me, Thy comforts delight my soul.",
    },
  },
  {
    ref: "Psalm 95:1",
    versions: {
      KJV: "O come, let us sing unto the LORD: let us make a joyful noise to the rock of our salvation.",
      WEB: "Oh come, let's sing to Yahweh. Let's shout aloud to the rock of our salvation.",
      ASV: "Oh come, let us sing unto Jehovah; Let us make a joyful noise to the rock of our salvation.",
      YLT: "Come, we sing to Jehovah, We shout to the rock of our salvation.",
    },
  },
  {
    ref: "Psalm 100:1",
    versions: {
      KJV: "Make a joyful noise unto the LORD, all ye lands.",
      WEB: "Shout for joy to Yahweh, all you lands!",
      ASV: "Make a joyful noise unto Jehovah, all ye lands.",
      YLT: "Shout to Jehovah, all the earth.",
    },
  },
  {
    ref: "Psalm 100:4",
    versions: {
      KJV: "Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.",
      WEB: "Enter into his gates with thanksgiving, and into his courts with praise. Give thanks to him, and bless his name.",
      ASV: "Enter into his gates with thanksgiving, And into his courts with praise: Give thanks unto him, and bless his name.",
      YLT: "Come in to His gates with thanksgiving, To His courts with praise, Give thanks to Him, bless His name.",
    },
  },
  {
    ref: "Psalm 103:3",
    versions: {
      KJV: "Who forgiveth all thine iniquities; who healeth all thy diseases.",
      WEB: "Who forgives all your sins, who heals all your diseases,",
      ASV: "Who forgiveth all thine iniquities; Who healeth all thy diseases;",
      YLT: "Who is forgiving all thine iniquities, Who is healing all thy diseases,",
    },
  },
  {
    ref: "Psalm 103:12",
    versions: {
      KJV: "As far as the east is from the west, so far hath he removed our transgressions from us.",
      WEB: "As far as the east is from the west, so far has he removed our transgressions from us.",
      ASV: "As far as the east is from the west, So far hath he removed our transgressions from us.",
      YLT: "As the distance of east from west He hath put far from us our transgressions.",
    },
  },
  {
    ref: "Psalm 103:13",
    versions: {
      KJV: "Like as a father pitieth his children, so the LORD pitieth them that fear him.",
      WEB: "Like a father has compassion on his children, so Yahweh has compassion on those who fear him.",
      ASV: "Like as a father pitieth his children, So Jehovah pitieth them that fear him.",
      YLT: "As a father hath mercy on sons, Jehovah hath mercy on those fearing Him.",
    },
  },
  {
    ref: "Psalm 103:2",
    versions: {
      KJV: "Bless the LORD, O my soul, and forget not all his benefits.",
      WEB: "Bless Yahweh, my soul, and don't forget all his benefits,",
      ASV: "Bless Jehovah, O my soul, And forget not all his benefits:",
      YLT: "Bless, O my soul, Jehovah, And forget not all His benefits,",
    },
  },
  {
    ref: "Psalm 147:3",
    versions: {
      KJV: "He healeth the broken in heart, and bindeth up their wounds.",
      WEB: "He heals the broken in heart, and binds up their wounds.",
      ASV: "He healeth the broken in heart, And bindeth up their wounds.",
      YLT: "Who is giving healing to the broken of heart, And is binding up their griefs.",
    },
  },
  {
    ref: "Psalm 147:4",
    versions: {
      KJV: "He telleth the number of the stars; he calleth them all by their names.",
      WEB: "He counts the number of the stars. He calls them all by their names.",
      ASV: "He counteth the number of the stars; He calleth them all by their names.",
      YLT: "He is giving number to the stars, To all of them He giveth names.",
    },
  },
  {
    ref: "Psalm 118:24",
    versions: {
      KJV: "This is the day which the LORD hath made; we will rejoice and be glad in it.",
      WEB: "This is the day that Yahweh has made. We will rejoice and be glad in it!",
      ASV: "This is the day which Jehovah hath made; We will rejoice and be glad in it.",
      YLT: "This is the day Jehovah hath made, We rejoice and are glad in it.",
    },
  },
  {
    ref: "Psalm 118:8",
    versions: {
      KJV: "It is better to trust in the LORD than to put confidence in man.",
      WEB: "It is better to take refuge in Yahweh than to put confidence in man.",
      ASV: "It is better to take refuge in Jehovah Than to put confidence in man.",
      YLT: "Better to trust in Jehovah Than to trust in man.",
    },
  },
  {
    ref: "Psalm 118:14",
    versions: {
      KJV: "The LORD is my strength and song, and is become my salvation.",
      WEB: "Yah is my strength and song. He has become my salvation.",
      ASV: "Jehovah is my strength and song; And he is become my salvation.",
      YLT: "My strength and song is Jah, And He is to me for salvation.",
    },
  },
  {
    ref: "Psalm 121:1",
    versions: {
      KJV: "I will lift up mine eyes unto the hills, from whence cometh my help.",
      WEB: "I will lift up my eyes to the hills. Where does my help come from?",
      ASV: "I will lift up mine eyes unto the mountains: From whence shall my help come?",
      YLT: "I lift up mine eyes unto the hills, Whence cometh my help?",
    },
  },
  {
    ref: "Psalm 121:2",
    versions: {
      KJV: "My help cometh from the LORD, which made heaven and earth.",
      WEB: "My help comes from Yahweh, who made heaven and earth.",
      ASV: "My help cometh from Jehovah, Who made heaven and earth.",
      YLT: "My help is from Jehovah, Maker of heaven and earth.",
    },
  },
  {
    ref: "Psalm 121:7",
    versions: {
      KJV: "The LORD shall preserve thee from all evil: he shall preserve thy soul.",
      WEB: "Yahweh will keep you from all evil. He will keep your soul.",
      ASV: "Jehovah will preserve thee from all evil; He will preserve thy soul.",
      YLT: "Jehovah doth preserve thee from all evil, He doth preserve thy soul.",
    },
  },
  {
    ref: "Psalm 126:5",
    versions: {
      KJV: "They that sow in tears shall reap in joy.",
      WEB: "Those who sow in tears will reap in joy.",
      ASV: "They that sow in tears shall reap in joy.",
      YLT: "They who sow in tears, in singing do reap.",
    },
  },
  {
    ref: "Psalm 127:1",
    versions: {
      KJV: "Except the LORD build the house, they labour in vain that build it.",
      WEB: "Unless Yahweh builds the house, they who build it labor in vain.",
      ASV: "Except Jehovah build the house, They labor in vain that build it:",
      YLT: "If Jehovah doth not build the house, In vain have its builders laboured at it.",
    },
  },
  {
    ref: "Psalm 139:14",
    versions: {
      KJV: "I will praise thee; for I am fearfully and wonderfully made.",
      WEB: "I will give thanks to you, for I am fearfully and wonderfully made.",
      ASV: "I will give thanks unto thee; for I am fearfully and wonderfully made:",
      YLT: "I thank Thee, because that with wonders I have been distinguished. Wonderful are Thy works, And my soul is knowing it well.",
    },
  },
  {
    ref: "Psalm 139:7",
    versions: {
      KJV: "Whither shall I go from thy spirit? or whither shall I flee from thy presence?",
      WEB: "Where could I go from your Spirit? Or where could I flee from your presence?",
      ASV: "Whither shall I go from thy Spirit? Or whither shall I flee from thy presence?",
      YLT: "Whither do I go from Thy Spirit? And whither from Thy face do I flee?",
    },
  },
  {
    ref: "Psalm 139:23",
    versions: {
      KJV: "Search me, O God, and know my heart: try me, and know my thoughts.",
      WEB: "Search me, God, and know my heart. Try me, and know my thoughts.",
      ASV: "Search me, O God, and know my heart: Try me, and know my thoughts;",
      YLT: "Search me, O God, and know my heart, Try me, and know my thoughts,",
    },
  },
  {
    ref: "Psalm 139:10",
    versions: {
      KJV: "Even there shall thy hand lead me, and thy right hand shall hold me.",
      WEB: "Even there your hand will lead me, and your right hand will hold me.",
      ASV: "Even there shall thy hand lead me, And thy right hand shall hold me.",
      YLT: "Also there Thy hand doth lead me, And Thy right hand doth hold me.",
    },
  },
  {
    ref: "Psalm 145:8",
    versions: {
      KJV: "The LORD is gracious, and full of compassion; slow to anger, and of great mercy.",
      WEB: "Yahweh is gracious, merciful, slow to anger, and of great loving kindness.",
      ASV: "Jehovah is gracious, and merciful; Slow to anger, and of great lovingkindness.",
      YLT: "Gracious and merciful is Jehovah, Slow to anger, and great in kindness.",
    },
  },
  {
    ref: "Psalm 145:18",
    versions: {
      KJV: "The LORD is nigh unto all them that call upon him, to all that call upon him in truth.",
      WEB: "Yahweh is near to all those who call on him, to all who call on him in truth.",
      ASV: "Jehovah is nigh unto all them that call upon him, To all that call upon him in truth.",
      YLT: "Near is Jehovah to all those calling Him, To all who call Him in truth.",
    },
  },
  {
    ref: "Psalm 145:14",
    versions: {
      KJV: "The LORD upholdeth all that fall, and raiseth up all those that be bowed down.",
      WEB: "Yahweh upholds all who fall, and raises up all those who are bowed down.",
      ASV: "Jehovah upholdeth all that fall, And raiseth up all those that are bowed down.",
      YLT: "Jehovah is supporting all who are falling, And raising up all the bowed down.",
    },
  },
  {
    ref: "Psalm 147:1",
    versions: {
      KJV: "Praise ye the LORD: for it is good to sing praises unto our God; for it is pleasant, and praise is comely.",
      WEB: "Praise Yah! For it is good to sing praises to our God, for it is pleasant and fitting to praise him.",
      ASV: "Praise ye Jehovah; For it is good to sing praises unto our God; For it is pleasant, and praise is comely.",
      YLT: "Praise ye Jah! for it is good to sing praise to our God, For it is pleasant, praise is comely.",
    },
  },
  {
    ref: "Psalm 147:11",
    versions: {
      KJV: "The LORD taketh pleasure in them that fear him, in those that hope in his mercy.",
      WEB: "Yahweh takes pleasure in those who fear him, in those who hope in his loving kindness.",
      ASV: "Jehovah taketh pleasure in them that fear him, In those that hope in his lovingkindness.",
      YLT: "Jehovah is accepting those fearing Him, Those waiting for His kindness.",
    },
  },
  {
    ref: "Psalm 16:11",
    versions: {
      KJV: "In thy presence is fulness of joy; at thy right hand there are pleasures for evermore.",
      WEB: "In your presence is fullness of joy. In your right hand there are pleasures forever more.",
      ASV: "In thy presence is fulness of joy; In thy right hand there are pleasures for evermore.",
      YLT: "Thou causest me to know the path of life; Fulness of joys is with Thy presence, Pleasant things by Thy right hand for ever.",
    },
  },
  {
    ref: "Psalm 16:8",
    versions: {
      KJV: "I have set the LORD always before me: because he is at my right hand, I shall not be moved.",
      WEB: "I have set Yahweh always before me. Because he is at my right hand, I shall not be moved.",
      ASV: "I have set Jehovah always before me: Because he is at my right hand, I shall not be moved.",
      YLT: "I have set Jehovah before me continually, Because -- at my right hand I am not moved.",
    },
  },
  {
    ref: "Psalm 16:6",
    versions: {
      KJV: "The lines are fallen unto me in pleasant places; yea, I have a goodly heritage.",
      WEB: "The lines have fallen to me in pleasant places. Yes, I have a good inheritance.",
      ASV: "The lines are fallen unto me in pleasant places; Yea, I have a goodly heritage.",
      YLT: "Lines have fallen to me in pleasant places, Yea, a beauteous inheritance is for me.",
    },
  },
  {
    ref: "Psalm 16:1",
    versions: {
      KJV: "Preserve me, O God: for in thee do I put my trust.",
      WEB: "Preserve me, God, for in you do I put my trust.",
      ASV: "Preserve me, O God; for in thee do I take refuge.",
      YLT: "Preserve me, O God, for I trusted in Thee.",
    },
  },
  {
    ref: "Psalm 27:1",
    versions: {
      KJV: "The LORD is my light and my salvation; whom shall I fear?",
      WEB: "Yahweh is my light and my salvation. Whom shall I fear?",
      ASV: "Jehovah is my light and my salvation; Whom shall I fear?",
      YLT: "Jehovah is my light and my salvation, Whom do I fear?",
    },
  },
  {
    ref: "Psalm 27:14",
    versions: {
      KJV: "Wait on the LORD: be of good courage, and he shall strengthen thine heart.",
      WEB: "Wait for Yahweh. Be strong, and let your heart take courage. Yes, wait for Yahweh.",
      ASV: "Wait for Jehovah: Be strong, and let thy heart take courage; Yea, wait thou for Jehovah.",
      YLT: "Wait on Jehovah, be strong, And He doth strengthen thy heart, Yea, wait on Jehovah!",
    },
  },
  {
    ref: "Psalm 27:10",
    versions: {
      KJV: "When my father and my mother forsake me, then the LORD will take me up.",
      WEB: "When my father and my mother forsake me, then Yahweh will take me up.",
      ASV: "When my father and my mother forsake me, Then Jehovah will take me up.",
      YLT: "When my father and my mother have forsaken me, Then doth Jehovah gather me.",
    },
  },
  {
    ref: "Psalm 27:13",
    versions: {
      KJV: "I had fainted, unless I had believed to see the goodness of the LORD in the land of the living.",
      WEB: "I am still confident of this: I will see the goodness of Yahweh in the land of the living.",
      ASV: "I had fainted, unless I had believed to see the goodness of Jehovah In the land of the living.",
      YLT: "Unless I had believed to look on the goodness of Jehovah In the land of the living --",
    },
  },
  {
    ref: "Psalm 18:2",
    versions: {
      KJV: "The LORD is my rock, and my fortress, and my deliverer.",
      WEB: "Yahweh is my rock, my fortress, and my deliverer;",
      ASV: "Jehovah is my rock, and my fortress, and my deliverer;",
      YLT: "Jehovah is my rock, and my bulwark, and my deliverer.",
    },
  },
  {
    ref: "Psalm 18:19",
    versions: {
      KJV: "He brought me forth also into a large place: he delivered me, because he delighted in me.",
      WEB: "He brought me out also into a large place. He delivered me, because he delighted in me.",
      ASV: "He brought me forth also into a large place; He delivered me, because he delighted in me.",
      YLT: "And He bringeth me out to a large place, He draweth me out, for He hath delighted in me.",
    },
  },
  {
    ref: "Psalm 18:6",
    versions: {
      KJV: "In my distress I called upon the LORD... he heard my voice out of his temple.",
      WEB: "In my distress I called on Yahweh... he heard my voice out of his temple,",
      ASV: "In my distress I called upon Jehovah... he heard my voice out of his temple,",
      YLT: "In my distress I call Jehovah... He doth hear from His temple my voice,",
    },
  },
  {
    ref: "Psalm 19:1",
    versions: {
      KJV: "The heavens declare the glory of God; and the firmament sheweth his handywork.",
      WEB: "The heavens declare the glory of God. The expanse shows his handiwork.",
      ASV: "The heavens declare the glory of God; And the firmament showeth his handiwork.",
      YLT: "The heavens are recounting the honour of God, And the work of His hands the expanse is declaring.",
    },
  },
  {
    ref: "Psalm 19:14",
    versions: {
      KJV: "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD.",
      WEB: "Let the words of my mouth and the meditation of my heart be acceptable in your sight, Yahweh,",
      ASV: "Let the words of my mouth and the meditation of my heart Be acceptable in thy sight, O Jehovah,",
      YLT: "Let the sayings of my mouth And the meditation of my heart, Be for a pleasing thing before Thee, O Jehovah,",
    },
  },
  {
    ref: "Psalm 20:7",
    versions: {
      KJV: "Some trust in chariots, and some in horses: but we will remember the name of the LORD our God.",
      WEB: "Some trust in chariots, and some in horses, but we trust the name of Yahweh our God.",
      ASV: "Some trust in chariots, and some in horses; But we will make mention of the name of Jehovah our God.",
      YLT: "Some of chariots, and some of horses, And we of the name of Jehovah our God Make mention.",
    },
  },
  {
    ref: "Psalm 37:1",
    versions: {
      KJV: "Fret not thyself because of evildoers, neither be thou envious against the workers of iniquity.",
      WEB: "Don't fret because of evildoers, neither be envious against those who do unrighteousness.",
      ASV: "Fret not thyself because of evil-doers, Neither be thou envious against them that work unrighteousness.",
      YLT: "Fret not thyself because of evil doers, Be not envious against doers of iniquity,",
    },
  },
  {
    ref: "Psalm 37:23",
    versions: {
      KJV: "The steps of a good man are ordered by the LORD: and he delighteth in his way.",
      WEB: "A man's steps are established by Yahweh. He delights in his way.",
      ASV: "A man's goings are established of Jehovah; And he delighteth in his way.",
      YLT: "From Jehovah are the steps of a man, They have been prepared, And his way he desireth.",
    },
  },
  {
    ref: "Psalm 40:1",
    versions: {
      KJV: "I waited patiently for the LORD; and he inclined unto me, and heard my cry.",
      WEB: "I waited patiently for Yahweh. He turned to me, and heard my cry.",
      ASV: "I waited patiently for Jehovah; And he inclined unto me, and heard my cry.",
      YLT: "I have diligently expected Jehovah, And He inclineth to me, and heareth my cry,",
    },
  },
  {
    ref: "Psalm 40:2",
    versions: {
      KJV: "He brought me up also out of an horrible pit, out of the miry clay, and set my feet upon a rock.",
      WEB: "He brought me up also out of a horrible pit, out of the miry clay. He set my feet on a rock, and gave me a firm place to stand.",
      ASV: "He brought me up also out of a horrible pit, out of the miry clay; And he set my feet upon a rock, and established my goings.",
      YLT: "And He causeth me to come up from a pit of desolation, from mud of mire, And He raiseth up on a rock my feet, He hath established my steps,",
    },
  },
  {
    ref: "Psalm 40:3",
    versions: {
      KJV: "And he hath put a new song in my mouth, even praise unto our God.",
      WEB: "He has put a new song in my mouth, even praise to our God.",
      ASV: "And he hath put a new song in my mouth, even praise unto our God:",
      YLT: "And He putteth in my mouth a new song, praise to our God.",
    },
  },
  {
    ref: "Psalm 42:1",
    versions: {
      KJV: "As the hart panteth after the water brooks, so panteth my soul after thee, O God.",
      WEB: "As the deer pants for the water brooks, so my soul pants after you, God.",
      ASV: "As the hart panteth after the water brooks, So panteth my soul after thee, O God.",
      YLT: "As the hart doth pant for streams of water, So my soul doth pant toward Thee, O God.",
    },
  },
  {
    ref: "Psalm 42:11",
    versions: {
      KJV: "Why art thou cast down, O my soul? and why art thou disquieted in me? hope thou in God.",
      WEB: "Why are you in despair, my soul? Why are you disturbed within me? Hope in God!",
      ASV: "Why art thou cast down, O my soul? And why art thou disquieted within me? Hope thou in God.",
      YLT: "What -- bowest thou thyself, O my soul? And what -- art thou disquieted within me? Wait for God,",
    },
  },
  {
    ref: "Psalm 46:2",
    versions: {
      KJV: "God is our refuge and strength, therefore will not we fear, though the earth be removed.",
      WEB: "God is our refuge and strength, therefore we will not be afraid, though the earth changes,",
      ASV: "Therefore will we not fear, though the earth do change, And though the mountains be shaken into the heart of the seas;",
      YLT: "Therefore we fear not in the changing of earth, And in the slipping of mountains Into the heart of the seas.",
    },
  },
  {
    ref: "Psalm 46:4",
    versions: {
      KJV: "There is a river, the streams whereof shall make glad the city of God.",
      WEB: "There is a river, the streams of which make the city of God glad,",
      ASV: "There is a river, the streams whereof make glad the city of God,",
      YLT: "A river, its streams rejoice the city of God,",
    },
  },
  {
    ref: "Jeremiah 17:7",
    versions: {
      KJV: "Blessed is the man that trusteth in the LORD, and whose hope the LORD is.",
      WEB: "Blessed is the man who trusts in Yahweh, and whose confidence is in Yahweh.",
      ASV: "Blessed is the man that trusteth in Jehovah, and whose trust Jehovah is.",
      YLT: "Blessed is the man who trusteth in Jehovah, And Jehovah hath been his confidence.",
    },
  },
  {
    ref: "Proverbs 3:5",
    versions: {
      KJV: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
      WEB: "Trust in Yahweh with all your heart, and don't lean on your own understanding.",
      ASV: "Trust in Jehovah with all thy heart, And lean not upon thine own understanding:",
      YLT: "Trust unto Jehovah with all thy heart, And unto thine own understanding lean not.",
    },
  },
  {
    ref: "Proverbs 3:6",
    versions: {
      KJV: "In all thy ways acknowledge him, and he shall direct thy paths.",
      WEB: "In all your ways acknowledge him, and he will make your paths straight.",
      ASV: "In all thy ways acknowledge him, And he will direct thy paths.",
      YLT: "In all thy ways know thou Him, And He doth make thy paths straight.",
    },
  },
  {
    ref: "Proverbs 17:22",
    versions: {
      KJV: "A merry heart doeth good like a medicine.",
      WEB: "A cheerful heart makes good medicine,",
      ASV: "A cheerful heart is a good medicine;",
      YLT: "A rejoicing heart doth good to the body,",
    },
  },
  {
    ref: "Proverbs 12:25",
    versions: {
      KJV: "Heaviness in the heart of man maketh it stoop: but a good word maketh it glad.",
      WEB: "Heaviness in the heart of man weighs it down, but a good word makes it glad.",
      ASV: "Heaviness in the heart of a man maketh it stoop; But a good word maketh it glad.",
      YLT: "Sorrow in the heart of man boweth down, And a good word maketh him glad.",
    },
  },
  {
    ref: "Proverbs 16:24",
    versions: {
      KJV: "Pleasant words are as an honeycomb, sweet to the soul, and health to the bones.",
      WEB: "Pleasant words are a honeycomb, sweet to the soul, and health to the bones.",
      ASV: "Pleasant words are as a honeycomb, Sweet to the soul, and health to the bones.",
      YLT: "Pleasant sayings are a honeycomb, Sweet to the soul, and healing to the bone.",
    },
  },
  {
    ref: "Proverbs 15:1",
    versions: {
      KJV: "A soft answer turneth away wrath: but grievous words stir up anger.",
      WEB: "A gentle answer turns away wrath, but a harsh word stirs up anger.",
      ASV: "A soft answer turneth away wrath; But a grievous word stirreth up anger.",
      YLT: "A soft answer turneth back fury, And a grievous word raiseth up anger.",
    },
  },
  {
    ref: "Proverbs 18:10",
    versions: {
      KJV: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      WEB: "Yahweh's name is a strong tower: the righteous run to him, and are safe.",
      ASV: "The name of Jehovah is a strong tower; The righteous runneth into it, and is safe.",
      YLT: "A tower of strength is the name of Jehovah, Into it the righteous runneth, and is set on high.",
    },
  },
  {
    ref: "Proverbs 18:24",
    versions: {
      KJV: "There is a friend that sticketh closer than a brother.",
      WEB: "There is a friend who sticks closer than a brother.",
      ASV: "and there is a friend that sticketh closer than a brother.",
      YLT: "And there is a lover sticking closer than a brother.",
    },
  },
  {
    ref: "Proverbs 27:17",
    versions: {
      KJV: "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.",
      WEB: "Iron sharpens iron; so a man sharpens his friend's countenance.",
      ASV: "Iron sharpeneth iron; So a man sharpeneth the countenance of his friend.",
      YLT: "Iron by iron is sharpened, And a man sharpeneth the face of his friend.",
    },
  },
  {
    ref: "Proverbs 27:19",
    versions: {
      KJV: "As in water face answereth to face, so the heart of man to man.",
      WEB: "As water reflects a face, so a man's heart reflects the man.",
      ASV: "As in water face answereth to face, So the heart of man to man.",
      YLT: "As water reflecteth face to face, So the heart of man to man.",
    },
  },
  {
    ref: "Proverbs 27:9",
    versions: {
      KJV: "Ointment and perfume rejoice the heart: so doth the sweetness of a man's friend by hearty counsel.",
      WEB: "Perfume and incense bring joy to the heart; so does earnest counsel from a man's friend.",
      ASV: "Oil and perfume rejoice the heart; So doth the sweetness of a man's friend that cometh of hearty counsel.",
      YLT: "Ointment and perfume rejoice the heart, And the sweetness of one's friend -- from counsel of the soul.",
    },
  },
  {
    ref: "Ecclesiastes 4:9",
    versions: {
      KJV: "Two are better than one; because they have a good reward for their labour.",
      WEB: "Two are better than one, because they have a good reward for their labor.",
      ASV: "Two are better than one; because they have a good reward for their labor.",
      YLT: "Better are the two than the one, because they have a good reward by their labour.",
    },
  },
  {
    ref: "Ecclesiastes 4:10",
    versions: {
      KJV: "For if they fall, the one will lift up his fellow.",
      WEB: "For if they fall, the one will lift up his fellow;",
      ASV: "For if they fall, the one will lift up his fellow; but woe to him that is alone when he falleth,",
      YLT: "For if they fall, the one raiseth up his companion, but wo to the one who falleth, and there is not a second to raise him up.",
    },
  },
  {
    ref: "Ecclesiastes 4:12",
    versions: {
      KJV: "And a threefold cord is not quickly broken.",
      WEB: "A three-fold cord is not quickly broken.",
      ASV: "and a threefold cord is not quickly broken.",
      YLT: "And the threefold cord is not hastily broken.",
    },
  },
  {
    ref: "Ecclesiastes 3:1",
    versions: {
      KJV: "To every thing there is a season, and a time to every purpose under the heaven.",
      WEB: "For everything there is a season, and a time for every purpose under heaven:",
      ASV: "For everything there is a season, and a time for every purpose under heaven:",
      YLT: "To everything -- a season, and a time to every delight under the heavens.",
    },
  },
  {
    ref: "Ecclesiastes 3:11",
    versions: {
      KJV: "He hath made every thing beautiful in his time.",
      WEB: "He has made everything beautiful in its time.",
      ASV: "He hath made everything beautiful in its time:",
      YLT: "Even the whole He hath made beautiful in its season.",
    },
  },
  {
    ref: "Song of Solomon 8:7",
    versions: {
      KJV: "Many waters cannot quench love, neither can the floods drown it.",
      WEB: "Many waters can't quench love, neither can floods drown it.",
      ASV: "Many waters cannot quench love, Neither can floods drown it:",
      YLT: "Many waters are not able to quench the love, And floods do not wash it away.",
    },
  },
  {
    ref: "Isaiah 40:31",
    versions: {
      KJV: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.",
      WEB: "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles.",
      ASV: "but they that wait for Jehovah shall renew their strength; they shall mount up with wings as eagles;",
      YLT: "And those expecting Jehovah pass to power, They raise up the pinion as eagles.",
    },
  },
  {
    ref: "Isaiah 40:29",
    versions: {
      KJV: "He giveth power to the faint; and to them that have no might he increaseth strength.",
      WEB: "He gives power to the weak. He increases the strength of him who has no might.",
      ASV: "He giveth power to the faint; and to him that hath no might he increaseth strength.",
      YLT: "He is giving power to the weary, And to the powerless He increaseth might.",
    },
  },
  {
    ref: "Isaiah 40:1",
    versions: {
      KJV: "Comfort ye, comfort ye my people, saith your God.",
      WEB: "Comfort, comfort my people, says your God.",
      ASV: "Comfort ye, comfort ye my people, saith your God.",
      YLT: "Comfort ye, comfort ye My people, saith your God.",
    },
  },
  {
    ref: "Isaiah 40:11",
    versions: {
      KJV: "He shall feed his flock like a shepherd: he shall gather the lambs with his arm.",
      WEB: "He will feed his flock like a shepherd. He will gather the lambs in his arm,",
      ASV: "He will feed his flock like a shepherd, he will gather the lambs in his arm,",
      YLT: "As a shepherd His flock He feedeth, With His arm He gathereth lambs,",
    },
  },
  {
    ref: "Isaiah 41:10",
    versions: {
      KJV: "Fear thou not; for I am with thee: be not dismayed; for I am thy God.",
      WEB: "Don't you be afraid, for I am with you. Don't be dismayed, for I am your God.",
      ASV: "fear thou not, for I am with thee; be not dismayed, for I am thy God;",
      YLT: "Be not thou afraid, for with thee I am, Look not around, for I am thy God,",
    },
  },
  {
    ref: "Isaiah 43:2",
    versions: {
      KJV: "When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee.",
      WEB: "When you pass through the waters, I will be with you, and through the rivers, they will not overwhelm you.",
      ASV: "When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee:",
      YLT: "When thou passest into waters, I am with thee, And into floods, they do not overflow thee,",
    },
  },
  {
    ref: "Isaiah 43:1",
    versions: {
      KJV: "Fear not: for I have redeemed thee, I have called thee by thy name; thou art mine.",
      WEB: "Don't be afraid, for I have redeemed you. I have called you by your name. You are mine.",
      ASV: "Fear not, for I have redeemed thee; I have called thee by thy name, thou art mine.",
      YLT: "Fear not, for I have redeemed thee, I have called on thy name -- thou art Mine.",
    },
  },
  {
    ref: "Isaiah 51:12",
    versions: {
      KJV: "I, even I, am he that comforteth you.",
      WEB: "I, even I, am he who comforts you.",
      ASV: "I, even I, am he that comforteth you:",
      YLT: "I -- I am He -- your comforter,",
    },
  },
  {
    ref: "Isaiah 52:7",
    versions: {
      KJV: "How beautiful upon the mountains are the feet of him that bringeth good tidings.",
      WEB: "How beautiful on the mountains are the feet of him who brings good news,",
      ASV: "How beautiful upon the mountains are the feet of him that bringeth good tidings,",
      YLT: "How comely on the mountains, Have been the feet of one proclaiming tidings,",
    },
  },
  {
    ref: "Isaiah 55:12",
    versions: {
      KJV: "For ye shall go out with joy, and be led forth with peace.",
      WEB: "For you shall go out with joy, and be led out with peace.",
      ASV: "For ye shall go out with joy, and be led forth with peace:",
      YLT: "For in joy ye go out, and in peace ye are brought in,",
    },
  },
  {
    ref: "Isaiah 55:8",
    versions: {
      KJV: "For my thoughts are not your thoughts, neither are your ways my ways, saith the LORD.",
      WEB: "For my thoughts are not your thoughts, neither are your ways my ways, says Yahweh.",
      ASV: "For my thoughts are not your thoughts, neither are your ways my ways, saith Jehovah.",
      YLT: "For My thoughts are not your thoughts, Nor your ways My ways, an affirmation of Jehovah.",
    },
  },
  {
    ref: "Isaiah 55:6",
    versions: {
      KJV: "Seek ye the LORD while he may be found, call ye upon him while he is near.",
      WEB: "Seek Yahweh while he may be found. Call on him while he is near.",
      ASV: "Seek ye Jehovah while he may be found; call ye upon him while he is near:",
      YLT: "Seek ye Jehovah while He may be found, Call ye Him while He is near.",
    },
  },
  {
    ref: "Isaiah 61:1-2",
    versions: {
      KJV: "The Spirit of the Lord GOD is upon me... to comfort all that mourn.",
      WEB: "The Spirit of the Lord Yahweh is on me... to comfort all who mourn,",
      ASV: "The Spirit of the Lord Jehovah is upon me... to comfort all that mourn;",
      YLT: "The Spirit of the Lord Jehovah is on me... to comfort all mourners,",
    },
  },
  {
    ref: "Isaiah 61:3",
    versions: {
      KJV: "To appoint unto them that mourn in Zion, to give unto them beauty for ashes, the oil of joy for mourning.",
      WEB: "to provide for those who mourn in Zion, to give to them a garland for ashes, the oil of joy for mourning,",
      ASV: "to appoint unto them that mourn in Zion, to give unto them a garland for ashes, the oil of joy for mourning,",
      YLT: "To appoint to mourners in Zion, To give to them beauty instead of ashes, oil of joy instead of mourning,",
    },
  },
  {
    ref: "Isaiah 66:13",
    versions: {
      KJV: "As one whom his mother comforteth, so will I comfort you.",
      WEB: "As one whom his mother comforts, so I will comfort you.",
      ASV: "As one whom his mother comforteth, so will I comfort you;",
      YLT: "As one whom his mother comforteth, so do I comfort you,",
    },
  },
  {
    ref: "Isaiah 63:9",
    versions: {
      KJV: "In all their affliction he was afflicted, and the angel of his presence saved them.",
      WEB: "In all their affliction he was afflicted, and the angel of his presence saved them.",
      ASV: "In all their affliction he was afflicted, and the angel of his presence saved them:",
      YLT: "In all their distress He hath had distress, And the messenger of His presence saved them,",
    },
  },
  {
    ref: "Isaiah 26:3",
    versions: {
      KJV: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
      WEB: "You will keep whoever's mind is steadfast on you in perfect peace, because he trusts in you.",
      ASV: "Thou wilt keep him in perfect peace, whose mind is stayed on thee; because he trusteth in thee.",
      YLT: "An imagination sustained Thou fortifiest peace! peace! for in Thee it is confident.",
    },
  },
  {
    ref: "Isaiah 26:4",
    versions: {
      KJV: "Trust ye in the LORD for ever: for in the LORD JEHOVAH is everlasting strength.",
      WEB: "Trust in Yahweh forever, for in Yah, Yahweh, is an everlasting Rock.",
      ASV: "Trust ye in Jehovah for ever; for in Jehovah, even Jehovah, is an everlasting rock.",
      YLT: "Trust ye in Jehovah for ever, For in Jah Jehovah is a rock of ages,",
    },
  },
  {
    ref: "Isaiah 42:3",
    versions: {
      KJV: "A bruised reed shall he not break, and the smoking flax shall he not quench.",
      WEB: "He won't break a bruised reed. He won't quench a dimly burning wick.",
      ASV: "A bruised reed will he not break, and a dimly burning wick will he not quench:",
      YLT: "A bruised reed he breaketh not, And dim flax he quencheth not,",
    },
  },
  {
    ref: "Isaiah 12:2",
    versions: {
      KJV: "Behold, God is my salvation; I will trust, and not be afraid.",
      WEB: "Behold, God is my salvation. I will trust, and will not be afraid,",
      ASV: "Behold, God is my salvation; I will trust, and will not be afraid;",
      YLT: "Lo, God is my salvation, I trust, and fear not,",
    },
  },
  {
    ref: "Isaiah 12:3",
    versions: {
      KJV: "With joy shall ye draw water out of the wells of salvation.",
      WEB: "Therefore with joy you will draw water out of the wells of salvation.",
      ASV: "Therefore with joy shall ye draw water out of the wells of salvation.",
      YLT: "And ye have drawn waters with joy Out of the fountains of salvation.",
    },
  },
  {
    ref: "Isaiah 9:2",
    versions: {
      KJV: "The people that walked in darkness have seen a great light.",
      WEB: "The people who walked in darkness have seen a great light.",
      ASV: "The people that walked in darkness have seen a great light:",
      YLT: "The people who are walking in darkness Have seen a great light,",
    },
  },
  {
    ref: "Isaiah 9:6",
    versions: {
      KJV: "For unto us a child is born, unto us a son is given... and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace.",
      WEB: "For a child is born to us. A son is given to us... and his name will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.",
      ASV: "For unto us a child is born, unto us a son is given... and his name shall be called Wonderful, Counsellor, Mighty God, Everlasting Father, Prince of Peace.",
      YLT: "For a Child hath been born to us, A Son hath been given to us... and He doth call his name Wonderful, Counsellor, Mighty God, Father of Eternity, Prince of Peace.",
    },
  },
  {
    ref: "Isaiah 9:7",
    versions: {
      KJV: "Of the increase of his government and peace there shall be no end.",
      WEB: "Of the increase of his government and of his peace there shall be no end,",
      ASV: "Of the increase of his government and of peace there shall be no end,",
      YLT: "Of the increase of the government and of peace There is no end,",
    },
  },
  {
    ref: "Jeremiah 29:11",
    versions: {
      KJV: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
      WEB: "For I know the thoughts that I think toward you, says Yahweh, thoughts of peace, and not of evil, to give you hope and a future.",
      ASV: "For I know the thoughts that I think toward you, saith Jehovah, thoughts of peace, and not of evil, to give you hope in your latter end.",
      YLT: "For I have known the thoughts that I am thinking towards you -- an affirmation of Jehovah; thoughts of peace, and not of evil, to give to you posterity and hope.",
    },
  },
  {
    ref: "Jeremiah 29:12",
    versions: {
      KJV: "Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto you.",
      WEB: "Then you shall call on me, and you shall go and pray to me, and I will listen to you.",
      ASV: "And ye shall call upon me, and ye shall go and pray unto me, and I will hearken unto you.",
      YLT: "And ye have called Me, and ye have gone, and prayed unto Me, and I have hearkened unto you,",
    },
  },
  {
    ref: "Jeremiah 29:13",
    versions: {
      KJV: "And ye shall seek me, and find me, when ye shall search for me with all your heart.",
      WEB: "You shall seek me, and find me, when you search for me with all your heart.",
      ASV: "And ye shall seek me, and find me, when ye shall search for me with all your heart.",
      YLT: "And ye have sought Me, and have found, for ye seek Me with all your heart.",
    },
  },
  {
    ref: "Jeremiah 17:7-8",
    versions: {
      KJV: "Blessed is the man that trusteth in the LORD, and whose hope the LORD is. For he shall be as a tree planted by the waters.",
      WEB: "Blessed is the man who trusts in Yahweh, and whose confidence is in Yahweh. For he will be as a tree planted by the waters,",
      ASV: "Blessed is the man that trusteth in Jehovah, and whose trust Jehovah is. For he shall be as a tree planted by the waters,",
      YLT: "Blessed is the man who trusteth in Jehovah, And Jehovah hath been his confidence. And he hath been as a tree planted by waters,",
    },
  },
  {
    ref: "Jeremiah 32:27",
    versions: {
      KJV: "Is any thing too hard for me?",
      WEB: "Is there anything too hard for me?",
      ASV: "is there anything too hard for me?",
      YLT: "from Me is anything too wonderful?",
    },
  },
  {
    ref: "Jeremiah 33:3",
    versions: {
      KJV: "Call unto me, and I will answer thee, and shew thee great and mighty things, which thou knowest not.",
      WEB: "Call to me, and I will answer you, and will show you great and difficult things, which you don't know.",
      ASV: "Call unto me, and I will answer thee, and will show thee great things, and difficult, which thou knowest not.",
      YLT: "Call unto Me, and I answer thee, and declare to thee great and fenced things, which thou hast not known.",
    },
  },
  {
    ref: "Jeremiah 31:3",
    versions: {
      KJV: "I have loved thee with an everlasting love: therefore with lovingkindness have I drawn thee.",
      WEB: "I have loved you with an everlasting love; therefore I have drawn you with loving kindness.",
      ASV: "Yea, I have loved thee with an everlasting love: therefore with lovingkindness have I drawn thee.",
      YLT: "Yea, a love age-during I have loved thee, Therefore I have drawn thee with kindness.",
    },
  },
  {
    ref: "Lamentations 3:22",
    versions: {
      KJV: "It is of the LORD's mercies that we are not consumed, because his compassions fail not.",
      WEB: "It is because of Yahweh's loving kindnesses that we are not consumed, because his compassion doesn't fail.",
      ASV: "It is of Jehovah's lovingkindnesses that we are not consumed, because his compassions fail not.",
      YLT: "The kindnesses of Jehovah! For we have not been consumed, For not ended have His mercies.",
    },
  },
  {
    ref: "Lamentations 3:23",
    versions: {
      KJV: "They are new every morning: great is thy faithfulness.",
      WEB: "They are new every morning. Great is your faithfulness.",
      ASV: "They are new every morning; Great is thy faithfulness.",
      YLT: "New every morning, abundant is Thy faithfulness.",
    },
  },
  {
    ref: "Lamentations 3:25",
    versions: {
      KJV: "The LORD is good unto them that wait for him, to the soul that seeketh him.",
      WEB: "Yahweh is good to those who wait for him, to the soul who seeks him.",
      ASV: "Jehovah is good unto them that wait for him, to the soul that seeketh him.",
      YLT: "Good is Jehovah to those waiting for Him, To the soul that seeketh Him.",
    },
  },
  {
    ref: "Ezekiel 36:26",
    versions: {
      KJV: "A new heart also will I give you, and a new spirit will I put within you.",
      WEB: "I will also give you a new heart, and I will put a new spirit within you.",
      ASV: "A new heart also will I give you, and a new spirit will I put within you;",
      YLT: "And I have given to you a new heart, and a new spirit I give in your midst,",
    },
  },
  {
    ref: "Ezekiel 37:3",
    versions: {
      KJV: "Can these bones live?",
      WEB: "Can these bones live?",
      ASV: "can these bones live?",
      YLT: "can these bones live?",
    },
  },
  {
    ref: "Daniel 3:17",
    versions: {
      KJV: "Our God whom we serve is able to deliver us.",
      WEB: "Our God whom we serve is able to deliver us.",
      ASV: "If it be so, our God whom we serve is able to deliver us",
      YLT: "if it be so, our God whom we are serving, is able to deliver us,",
    },
  },
  {
    ref: "Daniel 12:3",
    versions: {
      KJV: "And they that be wise shall shine as the brightness of the firmament.",
      WEB: "Those who are wise will shine as the brightness of the expanse.",
      ASV: "And they that are wise shall shine as the brightness of the firmament;",
      YLT: "And those teaching do shine as the brightness of the expanse,",
    },
  },
  {
    ref: "Daniel 2:21",
    versions: {
      KJV: "He giveth wisdom unto the wise, and knowledge to them that know understanding.",
      WEB: "He gives wisdom to the wise, and knowledge to those who have understanding.",
      ASV: "he giveth wisdom unto the wise, and knowledge to them that have understanding:",
      YLT: "He is giving wisdom to the wise, and knowledge to those possessing understanding.",
    },
  },
  {
    ref: "Hosea 14:4",
    versions: {
      KJV: "I will heal their backsliding, I will love them freely: for mine anger is turned away.",
      WEB: "I will heal their waywardness. I will love them freely; for my anger is turned away from him.",
      ASV: "I will heal their backsliding, I will love them freely; for mine anger is turned away from him.",
      YLT: "I heal their backsliding, I love them freely, For turned back hath Mine anger from him.",
    },
  },
  {
    ref: "Hosea 6:1",
    versions: {
      KJV: "Come, and let us return unto the LORD: for he hath torn, and he will heal us.",
      WEB: "Come, and let us return to Yahweh; for he has torn us to pieces, and he will heal us.",
      ASV: "Come, and let us return unto Jehovah; for he hath torn, and he will heal us;",
      YLT: "Come, and we turn back unto Jehovah, For He hath torn, and He doth heal us,",
    },
  },
  {
    ref: "Joel 2:25",
    versions: {
      KJV: "And I will restore to you the years that the locust hath eaten.",
      WEB: "I will restore to you the years that the swarming locust has eaten.",
      ASV: "And I will restore to you the years that the locust hath eaten,",
      YLT: "And I have recompensed to you the years that consumed hath the locust,",
    },
  },
  {
    ref: "Joel 3:16",
    versions: {
      KJV: "The LORD also will be the hope of his people, and the strength of the children of Israel.",
      WEB: "Yahweh will be a refuge for his people, and a stronghold for the children of Israel.",
      ASV: "but Jehovah will be a refuge unto his people, and a stronghold to the children of Israel.",
      YLT: "And Jehovah is a refuge to His people, And a stronghold to sons of Israel.",
    },
  },
  {
    ref: "Amos 5:14",
    versions: {
      KJV: "Seek good, and not evil, that ye may live: and so the LORD... shall be with you.",
      WEB: "Seek good, and not evil, that you may live; and so Yahweh... will be with you.",
      ASV: "Seek good, and not evil, that ye may live; and so Jehovah... will be with you,",
      YLT: "Seek good, and not evil, that ye may live, and it is so, Jehovah... is with you,",
    },
  },
  {
    ref: "Jonah 2:9",
    versions: {
      KJV: "The salvation is of the LORD.",
      WEB: "Salvation belongs to Yahweh.",
      ASV: "Salvation is of Jehovah.",
      YLT: "of Jehovah is salvation.",
    },
  },
  {
    ref: "Micah 6:8",
    versions: {
      KJV: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God.",
      WEB: "He has shown you, O man, what is good. What does Yahweh require of you, but to act justly, to love mercy, and to walk humbly with your God?",
      ASV: "He hath showed thee, O man, what is good; and what doth Jehovah require of thee, but to do justly, and to love kindness, and to walk humbly with thy God?",
      YLT: "He hath declared to thee, O man, what is good; Yea, what is Jehovah requiring of thee, Except -- to do judgment, and love kindness, And lowly to walk with thy God?",
    },
  },
  {
    ref: "Micah 7:18",
    versions: {
      KJV: "Who is a God like unto thee, that pardoneth iniquity... he retaineth not his anger for ever, because he delighteth in mercy.",
      WEB: "Who is a God like you, who pardons iniquity... he doesn't retain his anger forever, because he delights in loving kindness.",
      ASV: "Who is a God like unto thee, that pardoneth iniquity... He retaineth not his anger for ever, because he delighteth in lovingkindness.",
      YLT: "Who is a God like Thee? Taking away iniquity... He hath not held on His anger for ever, Because a lover of kindness is He.",
    },
  },
  {
    ref: "Nahum 1:7",
    versions: {
      KJV: "The LORD is good, a strong hold in the day of trouble; and he knoweth them that trust in him.",
      WEB: "Yahweh is good, a stronghold in the day of trouble; and he knows those who take refuge in him.",
      ASV: "Jehovah is good, a stronghold in the day of trouble; and he knoweth them that take refuge in him.",
      YLT: "Good is Jehovah for a strong place in a day of distress, And He is knowing those trusting in Him.",
    },
  },
  {
    ref: "Habakkuk 3:17-18",
    versions: {
      KJV: "Although the fig tree shall not blossom... yet I will rejoice in the LORD, I will joy in the God of my salvation.",
      WEB: "Although the fig tree doesn't flourish... yet I will rejoice in Yahweh. I will be joyful in the God of my salvation!",
      ASV: "For though the fig-tree shall not flourish... Yet I will rejoice in Jehovah, I will joy in the God of my salvation.",
      YLT: "Though the fig-tree doth not flourish... Yet I -- in Jehovah I exult, I joy in the God of my salvation.",
    },
  },
  {
    ref: "Habakkuk 2:4",
    versions: {
      KJV: "The just shall live by his faith.",
      WEB: "The righteous shall live by his faith.",
      ASV: "but the righteous shall live by his faith.",
      YLT: "the righteous by his stedfastness liveth.",
    },
  },
  {
    ref: "Zephaniah 3:17",
    versions: {
      KJV: "The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy.",
      WEB: "Yahweh, your God, is in the midst of you, a mighty one who will save. He will rejoice over you with joy.",
      ASV: "Jehovah thy God is in the midst of thee, a mighty one who will save; he will rejoice over thee with joy;",
      YLT: "Jehovah thy God is in thy midst, A mighty one doth save, He rejoiceth over thee with joy,",
    },
  },
  {
    ref: "Haggai 2:9",
    versions: {
      KJV: "The glory of this latter house shall be greater than of the former... and in this place will I give peace.",
      WEB: "The latter glory of this house will be greater than the former... and in this place I will give peace.",
      ASV: "The latter glory of this house shall be greater than the former... and in this place will I give peace.",
      YLT: "Greater is the honour of this latter house, Than of the former... and in this place do I give peace.",
    },
  },
  {
    ref: "Zechariah 4:6",
    versions: {
      KJV: "Not by might, nor by power, but by my spirit, saith the LORD of hosts.",
      WEB: "Not by might, nor by power, but by my Spirit, says Yahweh of Armies.",
      ASV: "Not by might, nor by power, but by my Spirit, saith Jehovah of hosts.",
      YLT: "Not by a force, nor by power, But -- by My Spirit, said Jehovah of Hosts.",
    },
  },
  {
    ref: "Zechariah 9:12",
    versions: {
      KJV: "Turn ye to the strong hold, ye prisoners of hope.",
      WEB: "Turn to the stronghold, you prisoners of hope!",
      ASV: "Turn you to the stronghold, ye prisoners of hope:",
      YLT: "Turn back to a fortress, ye prisoners of the hope,",
    },
  },
  {
    ref: "Malachi 4:2",
    versions: {
      KJV: "But unto you that fear my name shall the Sun of righteousness arise with healing in his wings.",
      WEB: "But to you who fear my name shall the sun of righteousness arise with healing in its wings.",
      ASV: "But unto you that fear my name shall the sun of righteousness arise with healing in its wings;",
      YLT: "given to you, ye who fear My name, Hath the sun of righteousness, And healing is in its wings,",
    },
  },
  {
    ref: "Matthew 5:4",
    versions: {
      KJV: "Blessed are they that mourn: for they shall be comforted.",
      WEB: "Blessed are those who mourn, for they shall be comforted.",
      ASV: "Blessed are they that mourn: for they shall be comforted.",
      YLT: "Happy the mourning -- because they shall be comforted.",
    },
  },
  {
    ref: "Matthew 5:3",
    versions: {
      KJV: "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
      WEB: "Blessed are the poor in spirit, for theirs is the Kingdom of Heaven.",
      ASV: "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
      YLT: "Happy the poor in spirit -- because theirs is the reign of the heavens.",
    },
  },
  {
    ref: "Matthew 5:14",
    versions: {
      KJV: "Ye are the light of the world.",
      WEB: "You are the light of the world.",
      ASV: "Ye are the light of the world.",
      YLT: "Ye are the light of the world.",
    },
  },
  {
    ref: "Matthew 5:16",
    versions: {
      KJV: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.",
      WEB: "Even so, let your light shine before men, that they may see your good works and glorify your Father who is in heaven.",
      ASV: "Even so let your light shine before men; that they may see your good works, and glorify your Father who is in heaven.",
      YLT: "So let your light shine before men, that they may see your good works, and may glorify your Father who is in the heavens.",
    },
  },
  {
    ref: "Matthew 6:34",
    versions: {
      KJV: "Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself.",
      WEB: "Therefore don't be anxious for tomorrow, for tomorrow will be anxious for itself.",
      ASV: "Be not therefore anxious for the morrow: for the morrow will be anxious for itself.",
      YLT: "Be not therefore anxious for the morrow, for the morrow shall be anxious for its own things; sufficient for the day is the evil of it.",
    },
  },
  {
    ref: "Matthew 6:26",
    versions: {
      KJV: "Behold the fowls of the air: for they sow not, neither do they reap... yet your heavenly Father feedeth them.",
      WEB: "See the birds of the sky, that they don't sow, neither reap... yet your heavenly Father feeds them.",
      ASV: "Behold the birds of the heaven, that they sow not, neither do they reap... yet your heavenly Father feedeth them.",
      YLT: "Look to the fowls of the heaven, for they do not sow, nor reap, nor gather... and your heavenly Father doth nourish them;",
    },
  },
  {
    ref: "Matthew 7:7",
    versions: {
      KJV: "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.",
      WEB: "Ask, and it will be given you. Seek, and you will find. Knock, and it will be opened for you.",
      ASV: "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you:",
      YLT: "Ask, and it shall be given to you; seek, and ye shall find; knock, and it shall be opened to you;",
    },
  },
  {
    ref: "Matthew 11:28",
    versions: {
      KJV: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      WEB: "Come to me, all you who labor and are heavily burdened, and I will give you rest.",
      ASV: "Come unto me, all ye that labor and are heavy laden, and I will give you rest.",
      YLT: "Come unto me, all ye labouring and burdened, and I will give you rest,",
    },
  },
  {
    ref: "Matthew 11:29",
    versions: {
      KJV: "Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.",
      WEB: "Take my yoke upon you and learn from me, for I am gentle and lowly in heart; and you will find rest for your souls.",
      ASV: "Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.",
      YLT: "take my yoke upon you, and learn from me, because I am meek and humble in heart, and ye shall find rest to your souls,",
    },
  },
  {
    ref: "Matthew 11:30",
    versions: {
      KJV: "For my yoke is easy, and my burden is light.",
      WEB: "For my yoke is easy, and my burden is light.",
      ASV: "For my yoke is easy, and my burden is light.",
      YLT: "for my yoke is easy, and my burden is light.",
    },
  },
  {
    ref: "Matthew 12:20",
    versions: {
      KJV: "A bruised reed shall he not break, and smoking flax shall he not quench, till he send forth judgment unto victory.",
      WEB: "He won't break a bruised reed. He won't quench a smoking flax, until he leads justice to victory.",
      ASV: "A bruised reed shall he not break, And smoking flax shall he not quench, Till he send forth judgment unto victory.",
      YLT: "A bruised reed he shall not break, and smoking flax he shall not quench, till he may put forth judgment to victory,",
    },
  },
  {
    ref: "Matthew 14:27",
    versions: {
      KJV: "Be of good cheer; it is I; be not afraid.",
      WEB: "Cheer up! It is I! Don't be afraid.",
      ASV: "Be of good cheer; it is I; be not afraid.",
      YLT: "Be of good courage, I am he, be not afraid.",
    },
  },
  {
    ref: "Matthew 19:26",
    versions: {
      KJV: "With men this is impossible; but with God all things are possible.",
      WEB: "With men this is impossible, but with God all things are possible.",
      ASV: "With men this is impossible; but with God all things are possible.",
      YLT: "with men this is impossible, but with God all things are possible.",
    },
  },
  {
    ref: "Matthew 28:20",
    versions: {
      KJV: "Lo, I am with you alway, even unto the end of the world.",
      WEB: "Behold, I am with you always, even to the end of the age.",
      ASV: "and lo, I am with you always, even unto the end of the world.",
      YLT: "and lo, I am with you all the days -- till the full end of the age.",
    },
  },
  {
    ref: "Matthew 5:7",
    versions: {
      KJV: "Blessed are the merciful: for they shall obtain mercy.",
      WEB: "Blessed are the merciful, for they shall obtain mercy.",
      ASV: "Blessed are the merciful: for they shall obtain mercy.",
      YLT: "Happy the kind -- because they shall find kindness.",
    },
  },
  {
    ref: "Mark 5:36",
    versions: {
      KJV: "Be not afraid, only believe.",
      WEB: "Don't be afraid, only believe.",
      ASV: "Fear not, only believe.",
      YLT: "Be not afraid, only believe.",
    },
  },
  {
    ref: "Mark 10:27",
    versions: {
      KJV: "With God all things are possible.",
      WEB: "For everything is possible for God.",
      ASV: "for all things are possible with God.",
      YLT: "for all things are possible with God.",
    },
  },
  {
    ref: "Mark 11:24",
    versions: {
      KJV: "What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.",
      WEB: "Whatever things you pray and ask for, believe that you have received them, and you shall have them.",
      ASV: "All things whatsoever ye pray and ask for, believe that ye have received them, and ye shall have them.",
      YLT: "All -- as many things as ye pray and ask -- believe that ye receive, and it shall be to you.",
    },
  },
  {
    ref: "Mark 4:39",
    versions: {
      KJV: "Peace, be still. And the wind ceased, and there was a great calm.",
      WEB: "Peace! Be still! The wind ceased, and there was a great calm.",
      ASV: "Peace, be still. And the wind ceased, and there was a great calm.",
      YLT: "Peace, be still; and the wind did lull, and there was a great calm.",
    },
  },
  {
    ref: "Mark 9:24",
    versions: {
      KJV: "Lord, I believe; help thou mine unbelief.",
      WEB: "Lord, I believe. Help my unbelief.",
      ASV: "I believe; help thou mine unbelief.",
      YLT: "I believe, sir; be helping mine unbelief.",
    },
  },
  {
    ref: "Luke 2:10",
    versions: {
      KJV: "Fear not: for, behold, I bring you good tidings of great joy.",
      WEB: "Don't be afraid, for behold, I bring you good news of great joy,",
      ASV: "Be not afraid; for behold, I bring you good tidings of great joy,",
      YLT: "fear not, for lo, I bring you good news of great joy, that shall be to all the people,",
    },
  },
  {
    ref: "Luke 2:14",
    versions: {
      KJV: "And on earth peace, good will toward men.",
      WEB: "and on earth peace, good will toward men.",
      ASV: "And on earth peace among men in whom he is well pleased.",
      YLT: "and upon earth peace, among men -- good will.",
    },
  },
  {
    ref: "Luke 6:38",
    versions: {
      KJV: "Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over.",
      WEB: "Give, and it will be given to you: good measure, pressed down, shaken together, and running over, will be given to you.",
      ASV: "give, and it shall be given unto you; good measure, pressed down, shaken together, running over,",
      YLT: "give, and it shall be given to you; good measure, pressed, and shaken, and running over, shall they give into your bosom,",
    },
  },
  {
    ref: "Luke 12:32",
    versions: {
      KJV: "Fear not, little flock; for it is your Father's good pleasure to give you the kingdom.",
      WEB: "Don't be afraid, little flock, for it is your Father's good pleasure to give you the Kingdom.",
      ASV: "Fear not, little flock; for it is your Father's good pleasure to give you the kingdom.",
      YLT: "Fear not, little flock, because your Father did delight to give you the reign;",
    },
  },
  {
    ref: "Luke 1:37",
    versions: {
      KJV: "For with God nothing shall be impossible.",
      WEB: "For everything spoken by God is possible.",
      ASV: "For no word from God shall be void of power.",
      YLT: "seeing nothing shall be impossible with God.",
    },
  },
  {
    ref: "Luke 1:47",
    versions: {
      KJV: "And my spirit hath rejoiced in God my Saviour.",
      WEB: "My spirit has rejoiced in God my Savior,",
      ASV: "And my spirit hath rejoiced in God my Saviour.",
      YLT: "And my spirit was glad on God my Saviour,",
    },
  },
  {
    ref: "Luke 6:23",
    versions: {
      KJV: "Rejoice, and be exceeding glad: for great is your reward in heaven.",
      WEB: "Rejoice in that day, and leap for joy, for behold, your reward is great in heaven,",
      ASV: "Rejoice in that day, and leap for joy: for behold, your reward is great in heaven;",
      YLT: "rejoice ye in that day, and leap, for lo, your reward is great in the heaven,",
    },
  },
  {
    ref: "Luke 18:4, Matthew 18:4",
    versions: {
      KJV: "Whosoever shall humble himself as this little child, the same is greatest in the kingdom of heaven.",
      WEB: "Whoever therefore humbles himself as this little child, the same is the greatest in the Kingdom of Heaven.",
      ASV: "Whosoever therefore shall humble himself as this little child, the same is the greatest in the kingdom of heaven.",
      YLT: "whoever then may humble himself as this child, this one is the greater in the reign of the heavens.",
    },
  },
  {
    ref: "Luke 15:10",
    versions: {
      KJV: "There is joy in the presence of the angels of God over one sinner that repenteth.",
      WEB: "There is joy in the presence of the angels of God over one sinner who repents.",
      ASV: "Even so, I say unto you, there is joy in the presence of the angels of God over one sinner that repenteth.",
      YLT: "so I say to you, joy doth come before the messengers of God over one sinner reforming.",
    },
  },
  {
    ref: "Luke 15:24",
    versions: {
      KJV: "This my son was dead, and is alive again; he was lost, and is found.",
      WEB: "For this, my son, was dead, and is alive again. He was lost, and is found.",
      ASV: "for this my son was dead, and is alive again; he was lost, and is found.",
      YLT: "because this my son was dead, and did live again, and he was lost, and was found;",
    },
  },
  {
    ref: "John 3:16",
    versions: {
      KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      WEB: "For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.",
      ASV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth on him should not perish, but have eternal life.",
      YLT: "for God did so love the world, that His Son -- the only begotten -- He gave, that every one who is believing in him may not perish, but may have life age-during.",
    },
  },
  {
    ref: "John 14:27",
    versions: {
      KJV: "Peace I leave with you, my peace I give unto you... let not your heart be troubled, neither let it be afraid.",
      WEB: "Peace I leave with you. My peace I give to you... don't let your heart be troubled, neither let it be fearful.",
      ASV: "Peace I leave with you; my peace I give unto you... Let not your heart be troubled, neither let it be fearful.",
      YLT: "peace I leave to you, my peace I give to you... let not your heart be troubled, nor let it be afraid.",
    },
  },
  {
    ref: "John 16:33",
    versions: {
      KJV: "These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.",
      WEB: "I have told you these things, that in me you may have peace. In the world you have oppression, but cheer up! I have overcome the world.",
      ASV: "These things have I spoken unto you, that in me ye may have peace. In the world ye have tribulation: but be of good cheer; I have overcome the world.",
      YLT: "these things I have spoken to you, that in me ye may have peace, in the world ye shall have tribulation, but take courage, I have overcome the world.",
    },
  },
  {
    ref: "John 14:6",
    versions: {
      KJV: "I am the way, the truth, and the life.",
      WEB: "I am the way, the truth, and the life.",
      ASV: "I am the way, and the truth, and the life:",
      YLT: "I am the way, and the truth, and the life,",
    },
  },
  {
    ref: "John 14:2",
    versions: {
      KJV: "In my Father's house are many mansions... I go to prepare a place for you.",
      WEB: "In my Father's house are many rooms... I am going to prepare a place for you.",
      ASV: "In my Father's house are many mansions... I go to prepare a place for you.",
      YLT: "in my Father's house are many mansions... I go to prepare a place for you;",
    },
  },
  {
    ref: "John 10:10",
    versions: {
      KJV: "I am come that they might have life, and that they might have it more abundantly.",
      WEB: "I came that they may have life, and may have it abundantly.",
      ASV: "I came that they may have life, and may have it abundantly.",
      YLT: "I came that they may have life, and may have it abundantly.",
    },
  },
  {
    ref: "John 10:11",
    versions: {
      KJV: "I am the good shepherd: the good shepherd giveth his life for the sheep.",
      WEB: "I am the good shepherd. The good shepherd lays down his life for the sheep.",
      ASV: "I am the good shepherd: the good shepherd layeth down his life for the sheep.",
      YLT: "I am the good shepherd; the good shepherd his life layeth down for the sheep;",
    },
  },
  {
    ref: "John 11:25",
    versions: {
      KJV: "I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live.",
      WEB: "I am the resurrection and the life. He who believes in me will still live, even if he dies.",
      ASV: "I am the resurrection, and the life: he that believeth on me, though he die, yet shall he live;",
      YLT: "I am the rising again, and the life; he who is believing in me, even if he may die, shall live;",
    },
  },
  {
    ref: "John 11:35",
    versions: {
      KJV: "Jesus wept.",
      WEB: "Jesus wept.",
      ASV: "Jesus wept.",
      YLT: "Jesus wept.",
    },
  },
  {
    ref: "John 14:15-16",
    versions: {
      KJV: "If ye love me, keep my commandments. And I will pray the Father, and he shall give you another Comforter.",
      WEB: "If you love me, keep my commandments. I will ask the Father, and he will give you another Counselor,",
      ASV: "If ye love me, ye will keep my commandments. And I will pray the Father, and he shall give you another Comforter,",
      YLT: "If ye love me, my commands keep, and I will ask the Father, and another Comforter He will give to you,",
    },
  },
  {
    ref: "John 14:26",
    versions: {
      KJV: "But the Comforter, which is the Holy Ghost... he shall teach you all things.",
      WEB: "But the Counselor, the Holy Spirit... will teach you all things.",
      ASV: "But the Comforter, even the Holy Spirit... he shall teach you all things,",
      YLT: "and the Comforter -- the Holy Spirit -- ... he shall teach you all things,",
    },
  },
  {
    ref: "John 15:11",
    versions: {
      KJV: "These things have I spoken unto you, that my joy might remain in you, and that your joy might be full.",
      WEB: "I have spoken these things to you, that my joy may remain in you, and that your joy may be made full.",
      ASV: "These things have I spoken unto you, that my joy may be in you, and that your joy may be made full.",
      YLT: "these things I have spoken to you, that my joy may remain in you, and your joy may be full.",
    },
  },
  {
    ref: "John 15:13",
    versions: {
      KJV: "Greater love hath no man than this, that a man lay down his life for his friends.",
      WEB: "Greater love has no one than this, that someone lay down his life for his friends.",
      ASV: "Greater love hath no man than this, that a man lay down his life for his friends.",
      YLT: "greater love than this hath no one, that any one his life may lay down for his friends.",
    },
  },
  {
    ref: "John 16:22",
    versions: {
      KJV: "Ye now therefore have sorrow: but I will see you again, and your heart shall rejoice, and your joy no man taketh from you.",
      WEB: "You therefore now have sorrow, but I will see you again, and your heart will rejoice, and no one will take your joy away from you.",
      ASV: "And ye therefore now have sorrow: but I will see you again, and your heart shall rejoice, and your joy no one taketh away from you.",
      YLT: "therefore now, indeed, sorrow have ye; and again I will see you, and your heart shall rejoice, and your joy no one doth take from you,",
    },
  },
  {
    ref: "John 16:24",
    versions: {
      KJV: "Ask, and ye shall receive, that your joy may be full.",
      WEB: "Ask, and you will receive, that your joy may be made full.",
      ASV: "Ask, and ye shall receive, that your joy may be made full.",
      YLT: "ask, and ye receive, that your joy may be full.",
    },
  },
  {
    ref: "John 8:12",
    versions: {
      KJV: "I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.",
      WEB: "I am the light of the world. He who follows me will not walk in the darkness, but will have the light of life.",
      ASV: "I am the light of the world: he that followeth me shall not walk in the darkness, but shall have the light of life.",
      YLT: "I am the light of the world; he who is following me shall not walk in the darkness, but he shall have the light of the life.",
    },
  },
  {
    ref: "John 8:36",
    versions: {
      KJV: "Then said Jesus... If the Son therefore shall make you free, ye shall be free indeed.",
      WEB: "Jesus said... If therefore the Son makes you free, you will be free indeed.",
      ASV: "If therefore the Son shall make you free, ye shall be free indeed.",
      YLT: "if then the son may make you free, in reality ye shall be free.",
    },
  },
  {
    ref: "John 8:32",
    versions: {
      KJV: "And ye shall know the truth, and the truth shall make you free.",
      WEB: "You will know the truth, and the truth will make you free.",
      ASV: "and ye shall know the truth, and the truth shall make you free.",
      YLT: "and ye shall know the truth, and the truth shall make you free.",
    },
  },
  {
    ref: "2 Chronicles 20:20",
    versions: {
      KJV: "Believe in the LORD, and ye shall be established; believe his prophets, so shall ye prosper.",
      WEB: "Believe in Yahweh your God, so you shall be established! Believe his prophets, so you shall prosper.",
      ASV: "Believe in Jehovah your God, so shall ye be established; believe his prophets, so shall ye prosper.",
      YLT: "remain stedfast in Jehovah your God, and be stedfast; give stedfast belief in His prophets, and prosper.",
    },
  },
  {
    ref: "1 Peter 1:8",
    versions: {
      KJV: "Whom having not seen, ye love; in whom, though now ye see him not, yet believing, ye rejoice with joy unspeakable and full of glory.",
      WEB: "Having not seen him, you love him. Though you don't see him now, you believe in him and rejoice greatly with joy unspeakable and full of glory,",
      ASV: "whom not having seen ye love; on whom, though now ye see him not, yet believing, ye rejoice greatly with joy unspeakable and full of glory:",
      YLT: "whom, not having seen, ye love, in whom, though now not seeing, and believing, ye are glad with joy unspeakable and glorified,",
    },
  },
  {
    ref: "Acts 1:8",
    versions: {
      KJV: "Ye shall receive power, after that the Holy Ghost is come upon you.",
      WEB: "You will receive power when the Holy Spirit has come on you.",
      ASV: "but ye shall receive power, when the Holy Spirit is come upon you:",
      YLT: "ye shall receive power, the Holy Spirit having come upon you,",
    },
  },
  {
    ref: "Acts 17:28",
    versions: {
      KJV: "In him we live, and move, and have our being.",
      WEB: "In him we live, move, and have our being,",
      ASV: "for in him we live, and move, and have our being;",
      YLT: "for in Him we live, and move, and are;",
    },
  },
  {
    ref: "Acts 20:35",
    versions: {
      KJV: "It is more blessed to give than to receive.",
      WEB: "It is more blessed to give than to receive.",
      ASV: "It is more blessed to give than to receive.",
      YLT: "it is more blessed to give than to receive.",
    },
  },
  {
    ref: "Acts 2:4",
    versions: {
      KJV: "And they were all filled with the Holy Ghost.",
      WEB: "They were all filled with the Holy Spirit,",
      ASV: "And they were all filled with the Holy Spirit,",
      YLT: "and they were all filled with the Holy Spirit,",
    },
  },
  {
    ref: "Acts 11:24",
    versions: {
      KJV: "Barnabas... a good man, and full of the Holy Ghost and of faith.",
      WEB: "Barnabas... a good man, full of the Holy Spirit and of faith,",
      ASV: "for he was a good man, and full of the Holy Spirit and of faith:",
      YLT: "because he was a good man, and full of the Holy Spirit, and of faith,",
    },
  },
  {
    ref: "Acts 4:36",
    versions: {
      KJV: "Joseph, who by the apostles was surnamed Barnabas... The son of consolation.",
      WEB: "Joseph, who by the apostles was surnamed Barnabas... Son of Encouragement,",
      ASV: "And Joseph, who by the apostles was surnamed Barnabas (which is, being interpreted, Son of exhortation),",
      YLT: "And Joses, who was surnamed Barnabas by the apostles... which is, having been interpreted, Son of Comfort,",
    },
  },
  {
    ref: "Romans 15:13",
    versions: {
      KJV: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
      WEB: "Now the God of hope fill you with all joy and peace in believing, that you may abound in hope in the power of the Holy Spirit.",
      ASV: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, in the power of the Holy Spirit.",
      YLT: "and the God of the hope shall fill you with all joy and peace in the believing, for your superabounding in the hope, in power of the Holy Spirit.",
    },
  },
  {
    ref: "Romans 8:28",
    versions: {
      KJV: "And we know that all things work together for good to them that love God.",
      WEB: "We know that all things work together for good for those who love God,",
      ASV: "And we know that to them that love God all things work together for good,",
      YLT: "and we have known that to those loving God all things do work together for good,",
    },
  },
  {
    ref: "Romans 8:31",
    versions: {
      KJV: "If God be for us, who can be against us?",
      WEB: "If God is for us, who can be against us?",
      ASV: "If God is for us, who is against us?",
      YLT: "if God is for us, who is against us?",
    },
  },
  {
    ref: "Romans 8:35",
    versions: {
      KJV: "Who shall separate us from the love of Christ?",
      WEB: "Who shall separate us from the love of Christ?",
      ASV: "Who shall separate us from the love of Christ?",
      YLT: "who shall separate us from the love of the Christ?",
    },
  },
  {
    ref: "Romans 8:39",
    versions: {
      KJV: "Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God.",
      WEB: "nor height, nor depth, nor any other created thing, will be able to separate us from the love of God,",
      ASV: "nor height, nor depth, nor any other creature, shall be able to separate us from the love of God,",
      YLT: "nor height, nor depth, nor any other created thing, shall be able to separate us from the love of God, that is in Christ Jesus our Lord.",
    },
  },
  {
    ref: "Romans 5:1",
    versions: {
      KJV: "Being justified by faith, we have peace with God through our Lord Jesus Christ.",
      WEB: "Being therefore justified by faith, we have peace with God through our Lord Jesus Christ;",
      ASV: "Being therefore justified by faith, we have peace with God through our Lord Jesus Christ;",
      YLT: "having been declared righteous, then, by faith, we have peace toward God through our Lord Jesus Christ,",
    },
  },
  {
    ref: "Romans 5:8",
    versions: {
      KJV: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.",
      WEB: "But God commends his own love toward us, in that while we were yet sinners, Christ died for us.",
      ASV: "But God commendeth his own love toward us, in that, while we were yet sinners, Christ died for us.",
      YLT: "and God doth commend His own love to us, that, in our being still sinners, Christ did die for us;",
    },
  },
  {
    ref: "Romans 5:4-5",
    versions: {
      KJV: "And patience, experience; and experience, hope: and hope maketh not ashamed.",
      WEB: "and perseverance, proven character; and proven character, hope:",
      ASV: "and stedfastness, approvedness; and approvedness, hope:",
      YLT: "and the endurance, experience; and the experience, hope; and the hope doth not make ashamed,",
    },
  },
  {
    ref: "Romans 5:3",
    versions: {
      KJV: "We glory in tribulations also: knowing that tribulation worketh patience.",
      WEB: "We also rejoice in our sufferings, knowing that suffering produces perseverance;",
      ASV: "and let us also rejoice in our tribulations: knowing that tribulation worketh stedfastness;",
      YLT: "and not only so, but we also boast in the tribulations, knowing that the tribulation doth work endurance;",
    },
  },
  {
    ref: "Romans 8:38-39",
    versions: {
      KJV: "For I am persuaded, that neither death, nor life... shall be able to separate us from the love of God.",
      WEB: "For I am persuaded, that neither death, nor life... will be able to separate us from the love of God,",
      ASV: "For I am persuaded, that neither death, nor life... shall be able to separate us from the love of God,",
      YLT: "for I am persuaded that neither death, nor life... shall be able to separate us from the love of God,",
    },
  },
  {
    ref: "Romans 12:12",
    versions: {
      KJV: "Rejoicing in hope; patient in tribulation; continuing instant in prayer.",
      WEB: "rejoicing in hope, enduring in troubles, continuing steadfastly in prayer,",
      ASV: "rejoicing in hope; patient in tribulation; continuing stedfastly in prayer;",
      YLT: "in the hope rejoicing; in the tribulation enduring; in the prayer persevering;",
    },
  },
  {
    ref: "Romans 12:21",
    versions: {
      KJV: "Be not overcome of evil, but overcome evil with good.",
      WEB: "Don't be overcome by evil, but overcome evil with good.",
      ASV: "Be not overcome of evil, but overcome evil with good.",
      YLT: "be not overcome by the evil, but overcome, in the good, the evil.",
    },
  },
  {
    ref: "Romans 12:15",
    versions: {
      KJV: "Rejoice with them that do rejoice, and weep with them that weep.",
      WEB: "Rejoice with those who rejoice. Weep with those who weep.",
      ASV: "Rejoice with them that rejoice; weep with them that weep.",
      YLT: "to rejoice with the rejoicing, and to weep with the weeping.",
    },
  },
  {
    ref: "Romans 12:9",
    versions: {
      KJV: "Let love be without dissimulation. Abhor that which is evil; cleave to that which is good.",
      WEB: "Let love be without hypocrisy. Abhor that which is evil. Cling to that which is good.",
      ASV: "Let love be without hypocrisy. Abhor that which is evil; cleave to that which is good.",
      YLT: "The love unfeigned; abhorring the evil; cleaving to the good;",
    },
  },
  {
    ref: "Romans 15:5",
    versions: {
      KJV: "Now the God of patience and consolation grant you to be likeminded one toward another.",
      WEB: "Now the God of perseverance and of encouragement grant you to be of the same mind with one another,",
      ASV: "Now the God of patience and of comfort grant you to be of the same mind one with another",
      YLT: "and may the God of the endurance and of the exhortation give to you to have the same mind toward one another, according to Christ Jesus,",
    },
  },
  {
    ref: "Romans 15:4",
    versions: {
      KJV: "For whatsoever things were written aforetime were written for our learning, that we through patience and comfort of the scriptures might have hope.",
      WEB: "For as many things as were written before were written for our learning, that through perseverance and through encouragement of the Scriptures we might have hope.",
      ASV: "For whatsoever things were written aforetime were written for our learning, that through patience and through comfort of the scriptures we might have hope.",
      YLT: "for, as many things as were written before, for our instruction were written before, that through the endurance, and the exhortation, of the Writings, we might have the hope.",
    },
  },
  {
    ref: "Romans 15:1",
    versions: {
      KJV: "We then that are strong ought to bear the infirmities of the weak, and not to please ourselves.",
      WEB: "Now we who are strong ought to bear the weaknesses of the weak, and not to please ourselves.",
      ASV: "Now we that are strong ought to bear the infirmities of the weak, and not to please ourselves.",
      YLT: "and we ought -- we who are strong -- to bear the infirmities of the weak, and not to please ourselves;",
    },
  },
  {
    ref: "Romans 14:17",
    versions: {
      KJV: "For the kingdom of God is not meat and drink; but righteousness, and peace, and joy in the Holy Ghost.",
      WEB: "For the Kingdom of God is not eating and drinking, but righteousness, peace, and joy in the Holy Spirit.",
      ASV: "for the kingdom of God is not eating and drinking, but righteousness and peace and joy in the Holy Spirit.",
      YLT: "for the reign of God is not eating and drinking, but righteousness, and peace, and joy, in the Holy Spirit;",
    },
  },
  {
    ref: "Romans 14:12",
    versions: {
      KJV: "So then every one of us shall give account of himself to God.",
      WEB: "So then each one of us will give account of himself to God.",
      ASV: "So then each one of us shall give account of himself to God.",
      YLT: "so, then, each of us concerning himself shall give reckoning to God;",
    },
  },
  {
    ref: "Romans 10:15",
    versions: {
      KJV: "How beautiful are the feet of them that preach the gospel of peace.",
      WEB: "How beautiful are the feet of those who preach the Good News of peace,",
      ASV: "How beautiful are the feet of them that bring glad tidings of good things!",
      YLT: "how beautiful the feet of those proclaiming good tidings of peace,",
    },
  },
  {
    ref: "1 Corinthians 13:4",
    versions: {
      KJV: "Charity suffereth long, and is kind; charity envieth not.",
      WEB: "Love is patient and is kind. Love doesn't envy.",
      ASV: "Love suffereth long, and is kind; love envieth not;",
      YLT: "The love is long-suffering, it is kind, the love doth not envy,",
    },
  },
  {
    ref: "1 Corinthians 13:7",
    versions: {
      KJV: "Beareth all things, believeth all things, hopeth all things, endureth all things.",
      WEB: "bears all things, believes all things, hopes all things, endures all things.",
      ASV: "beareth all things, believeth all things, hopeth all things, endureth all things.",
      YLT: "all things it beareth, all it believeth, all it hopeth, all it endureth.",
    },
  },
  {
    ref: "1 Corinthians 13:13",
    versions: {
      KJV: "And now abideth faith, hope, charity, these three; but the greatest of these is charity.",
      WEB: "But now faith, hope, and love remain, these three. The greatest of these is love.",
      ASV: "But now abideth faith, hope, love, these three; and the greatest of these is love.",
      YLT: "and now there doth remain faith, hope, love -- these three; and the greatest of these is love.",
    },
  },
  {
    ref: "1 Corinthians 10:13",
    versions: {
      KJV: "God is faithful, who will not suffer you to be tempted above that ye are able.",
      WEB: "God is faithful, who will not allow you to be tempted above what you are able,",
      ASV: "but God is faithful, who will not suffer you to be tempted above what ye are able;",
      YLT: "and God is faithful, who will not suffer you to be tempted above what ye are able,",
    },
  },
  {
    ref: "1 Corinthians 2:9",
    versions: {
      KJV: "Eye hath not seen, nor ear heard... the things which God hath prepared for them that love him.",
      WEB: "Things which an eye didn't see, and an ear didn't hear... which God prepared for those who love him.",
      ASV: "Things which eye saw not, and ear heard not... whatsoever things God prepared for them that love him.",
      YLT: "that which eye did not see, and ear did not hear... that God did prepare for those loving Him.",
    },
  },
  {
    ref: "1 Corinthians 15:58",
    versions: {
      KJV: "Therefore, my beloved brethren, be ye stedfast, unmoveable, always abounding in the work of the Lord.",
      WEB: "Therefore, my beloved brothers, be steadfast, immovable, always abounding in the Lord's work,",
      ASV: "Wherefore, my beloved brethren, be ye stedfast, unmoveable, always abounding in the work of the Lord,",
      YLT: "so that, my brethren beloved, become ye stedfast, unmovable, abounding in the work of the Lord at all times,",
    },
  },
  {
    ref: "1 Corinthians 15:55",
    versions: {
      KJV: "O death, where is thy sting? O grave, where is thy victory?",
      WEB: "Death, where is your sting? Hades, where is your victory?",
      ASV: "O death, where is thy victory? O death, where is thy sting?",
      YLT: "where, O Death, thy sting? where, O Hades, thy victory?",
    },
  },
  {
    ref: "1 Corinthians 16:13",
    versions: {
      KJV: "Watch ye, stand fast in the faith, quit you like men, be strong.",
      WEB: "Watch! Stand firm in the faith! Be courageous! Be strong!",
      ASV: "Watch ye, stand fast in the faith, quit you like men, be strong.",
      YLT: "watch ye, stand in the faith; be men, be strong;",
    },
  },
  {
    ref: "1 Corinthians 3:16",
    versions: {
      KJV: "Know ye not that ye are the temple of God, and that the Spirit of God dwelleth in you?",
      WEB: "Don't you know that you are a temple of God, and that God's Spirit lives in you?",
      ASV: "Know ye not that ye are a temple of God, and that the Spirit of God dwelleth in you?",
      YLT: "have ye not known that ye are a sanctuary of God, and the Spirit of God doth dwell in you?",
    },
  },
  {
    ref: "1 Corinthians 16:14",
    versions: {
      KJV: "Let all your things be done with charity.",
      WEB: "Let all that you do be done in love.",
      ASV: "Let all that ye do be done in love.",
      YLT: "let all your things be done in love.",
    },
  },
  {
    ref: "2 Corinthians 5:7",
    versions: {
      KJV: "For we walk by faith, not by sight.",
      WEB: "For we walk by faith, not by sight;",
      ASV: "(for we walk by faith, not by sight);",
      YLT: "for through faith we walk, not through sight --",
    },
  },
  {
    ref: "2 Corinthians 2:14",
    versions: {
      KJV: "Now thanks be unto God, which always causeth us to triumph in Christ.",
      WEB: "Now thanks be to God, who always leads us in triumph in Christ,",
      ASV: "But thanks be unto God, who always leadeth us in triumph in Christ,",
      YLT: "and to God thanks, who at all times is leading us in triumph in the Christ,",
    },
  },
  {
    ref: "2 Corinthians 1:3-4",
    versions: {
      KJV: "Blessed be God... the Father of mercies, and the God of all comfort; who comforteth us in all our tribulation.",
      WEB: "Blessed be the God... the Father of mercies and God of all comfort; who comforts us in all our affliction,",
      ASV: "Blessed be the God... the Father of mercies and God of all comfort; who comforteth us in all our affliction,",
      YLT: "Blessed is God... the Father of the mercies, and God of all comfort, who is comforting us in all our tribulation,",
    },
  },
  {
    ref: "2 Corinthians 4:17",
    versions: {
      KJV: "For our light affliction, which is but for a moment, worketh for us a far more exceeding and eternal weight of glory.",
      WEB: "For our light affliction, which is for the moment, works for us more and more exceedingly an eternal weight of glory,",
      ASV: "For our light affliction, which is for the moment, worketh for us more and more exceedingly an eternal weight of glory;",
      YLT: "for the momentary light matter of our tribulation, more exceedingly unto an age-during weight of glory doth work for us --",
    },
  },
  {
    ref: "2 Corinthians 4:8",
    versions: {
      KJV: "We are troubled on every side, yet not distressed; we are perplexed, but not in despair.",
      WEB: "We are pressed on every side, yet not crushed; perplexed, yet not to despair;",
      ASV: "We are pressed on every side, yet not straitened; perplexed, yet not unto despair;",
      YLT: "on every side being in tribulation, but not straitened; perplexed, but not in despair;",
    },
  },
  {
    ref: "2 Corinthians 5:17",
    versions: {
      KJV: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
      WEB: "Therefore if anyone is in Christ, he is a new creation. The old things have passed away. Behold, all things have become new.",
      ASV: "Wherefore if any man is in Christ, he is a new creature: the old things are passed away; behold, they are become new.",
      YLT: "so that if any one is in Christ -- he is a new creature; the old things did pass away, lo, become new have the all things.",
    },
  },
  {
    ref: "2 Corinthians 6:2",
    versions: {
      KJV: "For he saith, I have heard thee in a time accepted... behold, now is the day of salvation.",
      WEB: "For he says, I listened to you in an acceptable time... now is the acceptable time. Now is the day of salvation.",
      ASV: "for he saith, At an acceptable time I hearkened unto thee... behold, now is the day of salvation:",
      YLT: "in an acceptable time I did hear thee, and in a day of salvation I did help thee; lo, now is a well-accepted time; lo, now, a day of salvation.",
    },
  },
  {
    ref: "2 Corinthians 9:7",
    versions: {
      KJV: "God loveth a cheerful giver.",
      WEB: "God loves a cheerful giver.",
      ASV: "for God loveth a cheerful giver.",
      YLT: "for a cheerful giver doth God love;",
    },
  },
  {
    ref: "2 Corinthians 12:9",
    versions: {
      KJV: "My grace is sufficient for thee: for my strength is made perfect in weakness.",
      WEB: "My grace is sufficient for you, for my power is made perfect in weakness.",
      ASV: "My grace is sufficient for thee: for my power is made perfect in weakness.",
      YLT: "sufficient for thee is My grace, for My power in weakness is perfected;",
    },
  },
  {
    ref: "2 Corinthians 12:10",
    versions: {
      KJV: "When I am weak, then am I strong.",
      WEB: "When I am weak, then am I strong.",
      ASV: "for when I am weak, then am I strong.",
      YLT: "for when I am weak, then I am powerful;",
    },
  },
  {
    ref: "2 Timothy 4:18",
    versions: {
      KJV: "The Lord... shall deliver me from every evil work, and will preserve me unto his heavenly kingdom.",
      WEB: "The Lord... will deliver me from every evil work and will preserve me for his heavenly Kingdom;",
      ASV: "The Lord will deliver me from every evil work, and will save me unto his heavenly kingdom:",
      YLT: "and the Lord shall free me from every evil work, and shall save me -- to his heavenly kingdom;",
    },
  },
  {
    ref: "2 Corinthians 3:17",
    versions: {
      KJV: "Now the Lord is that Spirit: and where the Spirit of the Lord is, there is liberty.",
      WEB: "Now the Lord is the Spirit; and where the Spirit of the Lord is, there is liberty.",
      ASV: "Now the Lord is the Spirit: and where the Spirit of the Lord is, there is liberty.",
      YLT: "and the Lord is the Spirit; and where the Spirit of the Lord is, there is liberty;",
    },
  },
  {
    ref: "Galatians 5:22",
    versions: {
      KJV: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith.",
      WEB: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, and faithfulness,",
      ASV: "But the fruit of the Spirit is love, joy, peace, longsuffering, kindness, goodness, faithfulness,",
      YLT: "and the fruit of the Spirit is: love, joy, peace, long-suffering, kindness, goodness, faith,",
    },
  },
  {
    ref: "Galatians 6:9",
    versions: {
      KJV: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
      WEB: "Let's not be weary in doing good, for we will reap in due season, if we don't give up.",
      ASV: "And let us not be weary in well-doing: for in due season we shall reap, if we faint not.",
      YLT: "and in the doing good we may not be faint, for at the proper time we shall reap -- not desponding;",
    },
  },
  {
    ref: "Galatians 6:2",
    versions: {
      KJV: "Bear ye one another's burdens, and so fulfil the law of Christ.",
      WEB: "Bear one another's burdens, and so fulfill the law of Christ.",
      ASV: "Bear ye one another's burdens, and so fulfil the law of Christ.",
      YLT: "of one another the burdens bear ye, and so fill up the law of the Christ,",
    },
  },
  {
    ref: "Galatians 2:20",
    versions: {
      KJV: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me.",
      WEB: "I have been crucified with Christ, and it is no longer I who live, but Christ living in me.",
      ASV: "I have been crucified with Christ; and it is no longer I that live, but Christ liveth in me:",
      YLT: "with Christ I have been crucified, and live no more do I, and Christ doth live in me;",
    },
  },
  {
    ref: "Galatians 3:26",
    versions: {
      KJV: "For ye are all the children of God by faith in Christ Jesus.",
      WEB: "For you are all children of God, through faith in Christ Jesus.",
      ASV: "For ye are all sons of God, through faith, in Christ Jesus.",
      YLT: "for ye are all sons of God through the faith in Christ Jesus,",
    },
  },
  {
    ref: "Galatians 5:1",
    versions: {
      KJV: "Stand fast therefore in the liberty wherewith Christ hath made us free.",
      WEB: "Stand firm therefore in the liberty by which Christ has made us free,",
      ASV: "For freedom did Christ set us free: stand fast therefore, and be not entangled again in a yoke of bondage.",
      YLT: "In the freedom, then, with which Christ did make you free -- stand ye, and be not held fast again by a yoke of servitude;",
    },
  },
  {
    ref: "Ephesians 2:8",
    versions: {
      KJV: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
      WEB: "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God,",
      ASV: "for by grace have ye been saved through faith; and that not of yourselves, it is the gift of God;",
      YLT: "for by grace ye are having been saved, through faith, and this not of you -- of God the gift,",
    },
  },
  {
    ref: "Ephesians 2:10",
    versions: {
      KJV: "For we are his workmanship, created in Christ Jesus unto good works.",
      WEB: "For we are his workmanship, created in Christ Jesus for good works,",
      ASV: "For we are his workmanship, created in Christ Jesus for good works,",
      YLT: "for of Him we are workmanship, created in Christ Jesus to good works,",
    },
  },
  {
    ref: "Ephesians 3:17-18",
    versions: {
      KJV: "That ye, being rooted and grounded in love, may be able to comprehend... the love of Christ.",
      WEB: "That you, being rooted and grounded in love, may be strengthened to comprehend... the love of Christ,",
      ASV: "to the end that ye, being rooted and grounded in love, may be strong to apprehend... the love of Christ",
      YLT: "that ye, having been rooted and founded in love, may be in strength to comprehend... the love of the Christ,",
    },
  },
  {
    ref: "Ephesians 3:20",
    versions: {
      KJV: "Now unto him that is able to do exceeding abundantly above all that we ask or think.",
      WEB: "Now to him who is able to do exceedingly abundantly above all that we ask or think,",
      ASV: "Now unto him that is able to do exceeding abundantly above all that we ask or think,",
      YLT: "and to Him who is able above all things to do exceeding abundantly what we ask or think,",
    },
  },
  {
    ref: "Ephesians 4:32",
    versions: {
      KJV: "Be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.",
      WEB: "And be kind to one another, tender hearted, forgiving each other, just as God also in Christ forgave you.",
      ASV: "and be ye kind one to another, tenderhearted, forgiving each other, even as God also in Christ forgave you.",
      YLT: "and become kind one to another, tender-hearted, forgiving one another, according as also God in Christ did forgive you.",
    },
  },
  {
    ref: "Ephesians 4:29",
    versions: {
      KJV: "Let no corrupt communication proceed out of your mouth, but that which is good to the use of edifying.",
      WEB: "Let no corrupt speech proceed out of your mouth, but only what is good for building others up,",
      ASV: "Let no corrupt speech proceed out of your mouth, but such as is good for edifying as the need may be,",
      YLT: "no corrupt word out of your mouth let proceed, but what is good, to the use of building up, that it may give grace to those hearing;",
    },
  },
  {
    ref: "Ephesians 6:10",
    versions: {
      KJV: "Finally, my brethren, be strong in the Lord, and in the power of his might.",
      WEB: "Finally, be strong in the Lord, and in the strength of his might.",
      ASV: "Finally, be strong in the Lord, and in the strength of his might.",
      YLT: "As to the rest, my brethren, be strong in the Lord, and in the power of His might;",
    },
  },
  {
    ref: "Philippians 4:13",
    versions: {
      KJV: "I can do all things through Christ which strengtheneth me.",
      WEB: "I can do all things through Christ, who strengthens me.",
      ASV: "I can do all things in him that strengtheneth me.",
      YLT: "for all things I have strength, in Christ's strengthening me;",
    },
  },
  {
    ref: "Philippians 4:6",
    versions: {
      KJV: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
      WEB: "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.",
      ASV: "In nothing be anxious; but in everything by prayer and supplication with thanksgiving let your requests be made known unto God.",
      YLT: "for nothing be anxious, but in everything, by prayer, and by supplication, with thanksgiving, let your requests be made known unto God;",
    },
  },
  {
    ref: "Philippians 4:7",
    versions: {
      KJV: "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
      WEB: "And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.",
      ASV: "And the peace of God, which passeth all understanding, shall guard your hearts and your thoughts in Christ Jesus.",
      YLT: "and the peace of God, that is surpassing all understanding, shall guard your hearts and your thoughts, in Christ Jesus.",
    },
  },
  {
    ref: "Philippians 4:4",
    versions: {
      KJV: "Rejoice in the Lord alway: and again I say, Rejoice.",
      WEB: "Rejoice in the Lord always! Again I will say, rejoice!",
      ASV: "Rejoice in the Lord always: again I will say, Rejoice.",
      YLT: "Rejoice in the Lord always; again I will say, rejoice.",
    },
  },
  {
    ref: "Philippians 4:11",
    versions: {
      KJV: "I have learned, in whatsoever state I am, therewith to be content.",
      WEB: "I have learned, in whatever state I am, to be content in it.",
      ASV: "for I have learned, in whatsoever state I am, therein to be content.",
      YLT: "I did learn in the things in which I am -- to be content;",
    },
  },
  {
    ref: "Philippians 4:19",
    versions: {
      KJV: "But my God shall supply all your need according to his riches in glory by Christ Jesus.",
      WEB: "My God will supply every need of yours according to his riches in glory in Christ Jesus.",
      ASV: "And my God shall supply every need of yours according to his riches in glory in Christ Jesus.",
      YLT: "and my God shall supply all your need, according to His riches in glory, in Christ Jesus;",
    },
  },
  {
    ref: "Philippians 1:6",
    versions: {
      KJV: "Being confident of this very thing, that he which hath begun a good work in you will perform it.",
      WEB: "Being confident of this very thing, that he who began a good work in you will complete it,",
      ASV: "being confident of this very thing, that he who began a good work in you will perfect it until the day of Jesus Christ:",
      YLT: "having been confident of this very thing, that He who did begin in you a good work, will perform it till the day of Jesus Christ,",
    },
  },
  {
    ref: "Colossians 3:15",
    versions: {
      KJV: "And let the peace of God rule in your hearts, to the which also ye are called in one body; and be ye thankful.",
      WEB: "And let the peace of God rule in your hearts, to which also you were called in one body, and be thankful.",
      ASV: "And let the peace of Christ rule in your hearts, to the which also ye were called in one body; and be ye thankful.",
      YLT: "and let the peace of God rule in your hearts, to which also ye were called in one body, and become thankful.",
    },
  },
  {
    ref: "Colossians 3:12",
    versions: {
      KJV: "Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of mind, meekness, longsuffering.",
      WEB: "Put on therefore, as God's chosen ones, holy and beloved, a heart of compassion, kindness, lowliness, humility, and perseverance,",
      ASV: "Put on therefore, as God's elect, holy and beloved, a heart of compassion, kindness, lowliness, meekness, longsuffering;",
      YLT: "put on, therefore, as choice ones of God, holy and beloved, bowels of mercies, kindness, humble-mindedness, meekness, long-suffering,",
    },
  },
  {
    ref: "Colossians 3:14",
    versions: {
      KJV: "And above all these things put on charity, which is the bond of perfectness.",
      WEB: "Above all these things, walk in love, which is the bond of perfection.",
      ASV: "and above all these things put on love, which is the bond of perfectness.",
      YLT: "and above all these things -- the love, which is a bond of the perfection.",
    },
  },
  {
    ref: "Colossians 3:2",
    versions: {
      KJV: "Set your affection on things above, not on things on the earth.",
      WEB: "Set your mind on the things that are above, not on the things that are on the earth.",
      ASV: "Set your mind on the things that are above, not on the things that are upon the earth.",
      YLT: "the things above mind ye, not the things upon the earth,",
    },
  },
  {
    ref: "Colossians 1:27",
    versions: {
      KJV: "Christ in you, the hope of glory.",
      WEB: "Christ in you, the hope of glory,",
      ASV: "which is Christ in you, the hope of glory:",
      YLT: "which is Christ in you, the hope of the glory,",
    },
  },
  {
    ref: "1 Thessalonians 4:18",
    versions: {
      KJV: "Comfort one another with these words.",
      WEB: "Comfort one another with these words.",
      ASV: "Wherefore comfort one another with these words.",
      YLT: "so, then, comfort ye one another with these words.",
    },
  },
  {
    ref: "1 Thessalonians 5:11",
    versions: {
      KJV: "Wherefore comfort yourselves together, and edify one another.",
      WEB: "Therefore exhort one another, and build each other up,",
      ASV: "Wherefore exhort one another, and build each other up, even as also ye do.",
      YLT: "wherefore comfort one another, and build ye up one the one, as also ye do.",
    },
  },
  {
    ref: "1 Thessalonians 5:16-18",
    versions: {
      KJV: "Rejoice evermore. Pray without ceasing. In every thing give thanks.",
      WEB: "Rejoice always. Pray without ceasing. In everything give thanks,",
      ASV: "Rejoice always; pray without ceasing; in everything give thanks:",
      YLT: "Always rejoice. Without ceasing pray ye. In every thing give thanks,",
    },
  },
  {
    ref: "1 Thessalonians 5:23",
    versions: {
      KJV: "And the very God of peace sanctify you wholly.",
      WEB: "May the God of peace himself sanctify you completely.",
      ASV: "And the God of peace himself sanctify you wholly;",
      YLT: "and the God of the peace Himself sanctify you wholly,",
    },
  },
  {
    ref: "1 Thessalonians 5:24",
    versions: {
      KJV: "Faithful is he that calleth you, who also will do it.",
      WEB: "He who calls you is faithful, who will also do it.",
      ASV: "Faithful is he that calleth you, who will also do it.",
      YLT: "stedfast is He who is calling you, who also will do it.",
    },
  },
  {
    ref: "2 Thessalonians 2:16-17",
    versions: {
      KJV: "Now our Lord Jesus Christ himself, and God, even our Father... comfort your hearts, and stablish you in every good word and work.",
      WEB: "Now our Lord Jesus Christ himself, and God our Father... comfort your hearts and establish you in every good work and word.",
      ASV: "Now our Lord Jesus Christ himself, and God our Father... comfort your hearts and establish them in every good work and word.",
      YLT: "And our Lord Jesus Christ himself, and God even our Father... comfort your hearts, and establish you in every good word and work.",
    },
  },
  {
    ref: "2 Timothy 1:7",
    versions: {
      KJV: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
      WEB: "For God didn't give us a spirit of fear, but of power, love, and self-control.",
      ASV: "For God gave us not a spirit of fearfulness; but of power and love and discipline.",
      YLT: "for God did not give us a spirit of fear, but of power, and of love, and of a sound mind;",
    },
  },
  {
    ref: "2 Timothy 4:7",
    versions: {
      KJV: "I have fought a good fight, I have finished my course, I have kept the faith.",
      WEB: "I have fought the good fight. I have finished the course. I have kept the faith.",
      ASV: "I have fought the good fight, I have finished the course, I have kept the faith:",
      YLT: "the good fight I have fought, the course I have finished, the faith I have kept,",
    },
  },
  {
    ref: "2 Timothy 2:15",
    versions: {
      KJV: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed.",
      WEB: "Give diligence to present yourself approved by God, a workman who doesn't need to be ashamed,",
      ASV: "Give diligence to present thyself approved unto God, a workman that needeth not to be ashamed,",
      YLT: "be diligent to present thyself approved to God -- a workman irreproachable, rightly dividing the word of the truth;",
    },
  },
  {
    ref: "1 Timothy 4:12",
    versions: {
      KJV: "Let no man despise thy youth; but be thou an example of the believers.",
      WEB: "Let no man despise your youth, but be an example to those who believe,",
      ASV: "Let no man despise thy youth; but be thou an ensample to them that believe,",
      YLT: "let no one despise thy youth, but a pattern become thou of those believing,",
    },
  },
  {
    ref: "1 Timothy 6:6",
    versions: {
      KJV: "Godliness with contentment is great gain.",
      WEB: "But godliness with contentment is great gain.",
      ASV: "But godliness with contentment is great gain:",
      YLT: "But it is great gain -- the piety with contentment;",
    },
  },
  {
    ref: "Titus 2:13",
    versions: {
      KJV: "Looking for that blessed hope, and the glorious appearing of the great God.",
      WEB: "looking for the blessed hope and appearing of the glory of our great God",
      ASV: "looking for the blessed hope and appearing of the glory of the great God",
      YLT: "waiting for the blessed hope and manifestation of the glory of our great God and Saviour Jesus Christ,",
    },
  },
  {
    ref: "Titus 3:5",
    versions: {
      KJV: "According to his mercy he saved us, by the washing of regeneration, and renewing of the Holy Ghost.",
      WEB: "he saved us, through the washing of regeneration and renewing by the Holy Spirit,",
      ASV: "according to his mercy he saved us, through the washing of regeneration and renewing of the Holy Spirit,",
      YLT: "he did save us, through the bathing of regeneration, and renewing of the Holy Spirit,",
    },
  },
  {
    ref: "Philemon 1:15",
    versions: {
      KJV: "For perhaps he therefore departed for a season, that thou shouldest receive him for ever.",
      WEB: "For perhaps he was therefore separated from you for a while, that you would have him forever,",
      ASV: "For perhaps he was therefore parted from thee for a season, that thou shouldest have him for ever;",
      YLT: "for perhaps because of this he did depart for an hour, that age-duringly thou mayest have him,",
    },
  },
  {
    ref: "Hebrews 11:1",
    versions: {
      KJV: "Now faith is the substance of things hoped for, the evidence of things not seen.",
      WEB: "Now faith is assurance of things hoped for, proof of things not seen.",
      ASV: "Now faith is assurance of things hoped for, a conviction of things not seen.",
      YLT: "And faith is of things hoped for a confidence, of matters not seen a conviction,",
    },
  },
  {
    ref: "Hebrews 12:1",
    versions: {
      KJV: "Let us run with patience the race that is set before us.",
      WEB: "let's run with perseverance the race that is set before us,",
      ASV: "let us run with patience the race that is set before us,",
      YLT: "with patience we may run the contest that is set before us,",
    },
  },
  {
    ref: "Hebrews 12:2",
    versions: {
      KJV: "Looking unto Jesus the author and finisher of our faith.",
      WEB: "looking to Jesus, the author and perfecter of faith,",
      ASV: "looking unto Jesus the author and perfecter of our faith,",
      YLT: "looking to the author and perfecter of faith -- Jesus,",
    },
  },
  {
    ref: "Hebrews 10:23",
    versions: {
      KJV: "Let us hold fast the profession of our faith without wavering; for he is faithful that promised.",
      WEB: "Let's hold fast the confession of our hope without wavering; for he who promised is faithful.",
      ASV: "let us hold fast the confession of our hope that it waver not; for he is faithful that promised:",
      YLT: "may we hold fast the unwavering profession of the hope, for faithful is He who did promise;",
    },
  },
  {
    ref: "Hebrews 10:24",
    versions: {
      KJV: "And let us consider one another to provoke unto love and to good works.",
      WEB: "let's consider how to provoke one another to love and good works,",
      ASV: "and let us consider one another to provoke unto love and good works;",
      YLT: "and may we consider one another, to provoke to love and to good works,",
    },
  },
  {
    ref: "Hebrews 4:16",
    versions: {
      KJV: "Let us come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.",
      WEB: "Let's therefore draw near with boldness to the throne of grace, that we may receive mercy and may find grace for help in time of need.",
      ASV: "Let us therefore draw near with boldness unto the throne of grace, that we may receive mercy, and may find grace to help us in time of need.",
      YLT: "we may come near, then, with freedom, to the throne of the grace, that we may receive kindness, and find grace -- for seasonable help.",
    },
  },
  {
    ref: "Hebrews 13:8",
    versions: {
      KJV: "Jesus Christ the same yesterday, and to day, and for ever.",
      WEB: "Jesus Christ is the same yesterday, today, and forever.",
      ASV: "Jesus Christ is the same yesterday and to-day, yea and for ever.",
      YLT: "Jesus Christ -- yesterday, and to-day, the same, and to the ages;",
    },
  },
  {
    ref: "Hebrews 13:1",
    versions: {
      KJV: "Let brotherly love continue.",
      WEB: "Let brotherly love continue.",
      ASV: "Let love of the brethren continue.",
      YLT: "Let brotherly love remain;",
    },
  },
  {
    ref: "Hebrews 13:2",
    versions: {
      KJV: "Be not forgetful to entertain strangers: for thereby some have entertained angels unawares.",
      WEB: "Don't forget to show hospitality to strangers, for in doing so, some have entertained angels without knowing it.",
      ASV: "Forget not to show love unto strangers: for thereby some have entertained angels unawares.",
      YLT: "of the hospitality be not forgetful, for by this some did entertain messengers unawares;",
    },
  },
  {
    ref: "Hebrews 13:16",
    versions: {
      KJV: "But to do good and to communicate forget not: for with such sacrifices God is well pleased.",
      WEB: "But don't forget to be doing good and sharing, for with such sacrifices God is well pleased.",
      ASV: "But to do good and to communicate forget not: for with such sacrifices God is well pleased.",
      YLT: "and of doing good, and of fellowship, be not forgetful, for with such sacrifices God is well pleased.",
    },
  },
  {
    ref: "James 1:2",
    versions: {
      KJV: "My brethren, count it all joy when ye fall into divers temptations.",
      WEB: "Count it all joy, my brothers, when you fall into various temptations,",
      ASV: "Count it all joy, my brethren, when ye fall into manifold temptations;",
      YLT: "All joy count it, my brethren, when ye may fall into temptations manifold;",
    },
  },
  {
    ref: "James 1:3",
    versions: {
      KJV: "Knowing this, that the trying of your faith worketh patience.",
      WEB: "knowing that the testing of your faith produces endurance.",
      ASV: "knowing that the proving of your faith worketh patience.",
      YLT: "knowing that the proof of your faith doth work endurance,",
    },
  },
  {
    ref: "James 1:5",
    versions: {
      KJV: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally.",
      WEB: "But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach,",
      ASV: "But if any of you lacketh wisdom, let him ask of God, who giveth to all liberally and upbraideth not;",
      YLT: "and if any of you do lack wisdom, let him ask from God, who is giving to all liberally, and not reproaching, and it shall be given to him;",
    },
  },
  {
    ref: "James 1:17",
    versions: {
      KJV: "Every good gift and every perfect gift is from above, and cometh down from the Father of lights.",
      WEB: "Every good gift and every perfect gift is from above, coming down from the Father of lights,",
      ASV: "Every good gift and every perfect gift is from above, coming down from the Father of lights,",
      YLT: "every good giving, and every perfect gift is from above, coming down from the Father of the lights,",
    },
  },
  {
    ref: "James 4:8",
    versions: {
      KJV: "Draw nigh to God, and he will draw nigh to you.",
      WEB: "Draw near to God, and he will draw near to you.",
      ASV: "Draw nigh to God, and he will draw nigh to you.",
      YLT: "draw near to God, and He will draw near to you;",
    },
  },
  {
    ref: "James 5:16",
    versions: {
      KJV: "The effectual fervent prayer of a righteous man availeth much.",
      WEB: "The insistent prayer of a righteous person is powerfully effective.",
      ASV: "The supplication of a righteous man availeth much in its working.",
      YLT: "very strong is a working supplication of a righteous man.",
    },
  },
  {
    ref: "1 Peter 5:7",
    versions: {
      KJV: "Casting all your care upon him; for he careth for you.",
      WEB: "casting all your worries on him, because he cares for you.",
      ASV: "casting all your anxiety upon him, because he careth for you.",
      YLT: "all your care having cast upon Him, because He careth for you,",
    },
  },
  {
    ref: "1 Peter 1:3",
    versions: {
      KJV: "Blessed be the God and Father of our Lord Jesus Christ, which... hath begotten us again unto a lively hope.",
      WEB: "Blessed be the God and Father of our Lord Jesus Christ, who... has become our father again to a living hope",
      ASV: "Blessed be the God and Father of our Lord Jesus Christ, who... begat us again unto a living hope",
      YLT: "Blessed is the God and Father of our Lord Jesus Christ, who... did beget us again to a living hope,",
    },
  },
  {
    ref: "1 Peter 1:6",
    versions: {
      KJV: "Wherein ye greatly rejoice, though now for a season... ye are in heaviness through manifold temptations.",
      WEB: "in which you greatly rejoice, though now for a little while, if need be... you have been grieved by various trials,",
      ASV: "Wherein ye greatly rejoice, though now for a little while, if need be, ye have been put to grief in manifold trials,",
      YLT: "in this ye are glad, a little now, if it be necessary, being made to sorrow in manifold trials,",
    },
  },
  {
    ref: "1 Peter 4:8",
    versions: {
      KJV: "And above all things have fervent charity among yourselves: for charity shall cover the multitude of sins.",
      WEB: "And above all things be earnest in your love among yourselves, for love covers a multitude of sins.",
      ASV: "above all things being fervent in your love among yourselves; for love covereth a multitude of sins:",
      YLT: "and, before all things, having your love fervent to one another, because love shall cover a multitude of sins;",
    },
  },
  {
    ref: "1 Peter 4:10",
    versions: {
      KJV: "As every man hath received the gift, even so minister the same one to another.",
      WEB: "As each has received a gift, employ it in serving one another,",
      ASV: "According as each hath received a gift, ministering it among yourselves,",
      YLT: "each, according as he received a gift, ministering it to one another,",
    },
  },
  {
    ref: "1 Peter 5:6",
    versions: {
      KJV: "Humble yourselves therefore under the mighty hand of God, that he may exalt you in due time.",
      WEB: "Humble yourselves therefore under the mighty hand of God, that he may exalt you in due time,",
      ASV: "Humble yourselves therefore under the mighty hand of God, that he may exalt you in due time;",
      YLT: "Be humbled, then, under the powerful hand of God, that you He may exalt in good time,",
    },
  },
  {
    ref: "1 Peter 5:8",
    versions: {
      KJV: "Be sober, be vigilant; because your adversary the devil, as a roaring lion, walketh about.",
      WEB: "Be sober and self-controlled. Be watchful. Your adversary the devil walks around like a roaring lion,",
      ASV: "Be sober, be watchful: your adversary the devil, as a roaring lion, walketh about,",
      YLT: "Be sober, vigilant, because your opponent the devil, as a roaring lion, doth walk about, seeking whom he may swallow up,",
    },
  },
  {
    ref: "1 Peter 5:10",
    versions: {
      KJV: "But the God of all grace... after that ye have suffered a while, make you perfect, stablish, strengthen, settle you.",
      WEB: "But may the God of all grace... after you have suffered a little while, perfect, establish, strengthen, and settle you.",
      ASV: "And the God of all grace... after that ye have suffered a little while, shall himself perfect, establish, strengthen you.",
      YLT: "and the God of all grace... a little having suffered, Himself make you perfect, establish, strengthen, settle you;",
    },
  },
  {
    ref: "2 Peter 1:3",
    versions: {
      KJV: "According as his divine power hath given unto us all things that pertain unto life and godliness.",
      WEB: "seeing that his divine power has granted to us all things that pertain to life and godliness,",
      ASV: "seeing that his divine power hath granted unto us all things that pertain unto life and godliness,",
      YLT: "As all things to us His divine power hath granted, that pertain unto life and piety,",
    },
  },
  {
    ref: "2 Peter 3:9",
    versions: {
      KJV: "The Lord is not slack concerning his promise... but is longsuffering to us-ward.",
      WEB: "The Lord is not slow concerning his promise... but is patient with us,",
      ASV: "The Lord is not slack concerning his promise... but is longsuffering to you-ward,",
      YLT: "the Lord is not slow in regard to the promise... but is long-suffering to us,",
    },
  },
  {
    ref: "1 John 4:16",
    versions: {
      KJV: "God is love; and he that dwelleth in love dwelleth in God, and God in him.",
      WEB: "God is love. Whoever remains in love remains in God, and God remains in him.",
      ASV: "God is love; and he that abideth in love abideth in God, and God abideth in him.",
      YLT: "God is love, and he who is remaining in the love, in God he doth remain, and God in him.",
    },
  },
  {
    ref: "1 John 4:18",
    versions: {
      KJV: "There is no fear in love; but perfect love casteth out fear.",
      WEB: "There is no fear in love; but perfect love casts out fear,",
      ASV: "There is no fear in love: but perfect love casteth out fear,",
      YLT: "fear is not in the love, but perfect love doth cast out the fear,",
    },
  },
  {
    ref: "1 John 4:19",
    versions: {
      KJV: "We love him, because he first loved us.",
      WEB: "We love him, because he first loved us.",
      ASV: "We love, because he first loved us.",
      YLT: "we -- we love him, because He first loved us;",
    },
  },
  {
    ref: "1 John 1:9",
    versions: {
      KJV: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
      WEB: "If we confess our sins, he is faithful and righteous to forgive us the sins and to cleanse us from all unrighteousness.",
      ASV: "If we confess our sins, he is faithful and righteous to forgive us our sins, and to cleanse us from all unrighteousness.",
      YLT: "if we may confess our sins, stedfast He is and righteous that He may forgive us the sins, and may cleanse us from every unrighteousness;",
    },
  },
  {
    ref: "1 John 4:7",
    versions: {
      KJV: "Beloved, let us love one another: for love is of God.",
      WEB: "Beloved, let us love one another, for love is of God,",
      ASV: "Beloved, let us love one another: for love is of God;",
      YLT: "beloved, may we love one another, because the love is of God,",
    },
  },
  {
    ref: "1 John 5:14",
    versions: {
      KJV: "And this is the confidence that we have in him, that, if we ask any thing according to his will, he heareth us.",
      WEB: "This is the boldness which we have toward him, that if we ask anything according to his will, he listens to us.",
      ASV: "And this is the boldness which we have toward him, that, if we ask anything according to his will, he heareth us:",
      YLT: "and this is the boldness that we have toward Him, that if anything we may ask according to his will, He doth hear us,",
    },
  },
  {
    ref: "3 John 1:2",
    versions: {
      KJV: "Beloved, I wish above all things that thou mayest prosper and be in health, even as thy soul prospereth.",
      WEB: "Beloved, I pray that you may prosper in all things and be healthy, even as your soul prospers.",
      ASV: "Beloved, I pray that in all things thou mayest prosper and be in health, even as thy soul prospereth.",
      YLT: "beloved, concerning all things I desire thee to prosper, and to be in health, even as thy soul doth prosper,",
    },
  },
  {
    ref: "3 John 1:4",
    versions: {
      KJV: "I have no greater joy than to hear that my children walk in truth.",
      WEB: "I have no greater joy than this: to hear about my children walking in truth.",
      ASV: "Greater joy have I none than this, to hear of my children walking in the truth.",
      YLT: "greater than these things I have no joy, that I may hear of my children in truth walking.",
    },
  },
  {
    ref: "Jude 1:24",
    versions: {
      KJV: "Now unto him that is able to keep you from falling, and to present you faultless... with exceeding joy.",
      WEB: "Now to him who is able to keep them from stumbling, and to present you faultless... with exceeding joy,",
      ASV: "Now unto him that is able to guard you from stumbling, and to set you before the presence of his glory without blemish... in exceeding joy,",
      YLT: "And to Him who is able to guard you not stumbling, and to set you in the presence of His glory unblemished, in gladness,",
    },
  },
  {
    ref: "2 John 1:3",
    versions: {
      KJV: "Grace be with you, mercy, and peace, from God the Father, and from the Lord Jesus Christ, the Son of the Father, in truth and love.",
      WEB: "Grace, mercy, and peace will be with us, from God the Father and from the Lord Jesus Christ, the Son of the Father, in truth and love.",
      ASV: "Grace, mercy, peace shall be with us, from God the Father, and from Jesus Christ, the Son of the Father, in truth and love.",
      YLT: "grace, kindness, peace, be with you, from God the Father, and from the Lord Jesus Christ, the Son of the Father, in truth and love.",
    },
  },
  {
    ref: "Revelation 21:4",
    versions: {
      KJV: "And God shall wipe away all tears from their eyes; and there shall be no more death.",
      WEB: "He will wipe away every tear from their eyes. Death will be no more,",
      ASV: "and he shall wipe away every tear from their eyes; and death shall be no more;",
      YLT: "and God shall wipe away every tear from their eyes, and the death shall not be any more,",
    },
  },
  {
    ref: "Revelation 21:5",
    versions: {
      KJV: "Behold, I make all things new.",
      WEB: "Behold, I am making all things new.",
      ASV: "Behold, I make all things new.",
      YLT: "Lo, new I make all things.",
    },
  },
  {
    ref: "Revelation 3:20",
    versions: {
      KJV: "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him.",
      WEB: "Behold, I stand at the door and knock. If anyone hears my voice and opens the door, then I will come in to him,",
      ASV: "Behold, I stand at the door and knock: if any man hear my voice and open the door, I will come in to him,",
      YLT: "lo, I have stood at the door, and I knock; if any one may hear my voice, and may open the door, I will come in unto him, and will sup with him, and he with me.",
    },
  },
  {
    ref: "Revelation 1:8",
    versions: {
      KJV: "I am Alpha and Omega, the beginning and the ending, saith the Lord.",
      WEB: "I am the Alpha and the Omega, the Beginning and the End, says the Lord God,",
      ASV: "I am the Alpha and the Omega, saith the Lord God,",
      YLT: "I am the Alpha and the Omega -- beginning and end -- saith the Lord,",
    },
  },
  {
    ref: "Revelation 22:5",
    versions: {
      KJV: "And there shall be no night there; and they need no candle, neither light of the sun; for the Lord God giveth them light.",
      WEB: "There will be no night, and they need no lamp light or sunlight, for the Lord God will illuminate them.",
      ASV: "And there shall be night no more; and they need no light of lamp, neither light of sun; for the Lord God shall give them light:",
      YLT: "and night shall not be there, and they have no need of a lamp and light of a sun, because the Lord God doth give them light,",
    },
  },
  {
    ref: "Psalm 1:1-2",
    versions: {
      KJV: "Blessed is the man that walketh not in the counsel of the ungodly... but his delight is in the law of the LORD.",
      WEB: "Blessed is the man who doesn't walk in the counsel of the wicked... but his delight is in Yahweh's law.",
      ASV: "Blessed is the man that walketh not in the counsel of the wicked... but his delight is in the law of Jehovah;",
      YLT: "O the happiness of that one, who hath not walked in the counsel of the wicked... but in the law of Jehovah is his delight,",
    },
  },
  {
    ref: "Psalm 1:3",
    versions: {
      KJV: "He shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season.",
      WEB: "He will be like a tree planted by the streams of water, that produces its fruit in its season,",
      ASV: "And he shall be like a tree planted by the streams of water, That bringeth forth its fruit in its season,",
      YLT: "And he hath been as a tree, planted by streams of water, that giveth its fruit in its season,",
    },
  },
  {
    ref: "Psalm 9:9",
    versions: {
      KJV: "The LORD also will be a refuge for the oppressed, a refuge in times of trouble.",
      WEB: "Yahweh will also be a high tower for the oppressed; a high tower in times of trouble.",
      ASV: "Jehovah also will be a high tower for the oppressed, A high tower in times of trouble;",
      YLT: "And Jehovah is a tower for the oppressed, A tower for times of adversity.",
    },
  },
  {
    ref: "Psalm 11:4",
    versions: {
      KJV: "The LORD is in his holy temple, the LORD's throne is in heaven.",
      WEB: "Yahweh is in his holy temple. Yahweh is on his throne in heaven.",
      ASV: "Jehovah is in his holy temple; Jehovah, his throne is in heaven;",
      YLT: "Jehovah is in His holy palace, Jehovah -- in the heavens His throne,",
    },
  },
  {
    ref: "Psalm 13:1,5",
    versions: {
      KJV: "How long wilt thou forget me, O LORD? for ever?... But I have trusted in thy mercy; my heart shall rejoice in thy salvation.",
      WEB: "How long, Yahweh? Will you forget me forever?... But I have trusted in your loving kindness. My heart rejoices in your salvation.",
      ASV: "How long wilt thou forget me, O Jehovah? for ever?... But I have trusted in thy lovingkindness; My heart shall rejoice in thy salvation.",
      YLT: "Till when, O Jehovah, dost Thou forget me for ever?... And I in Thy kindness did trust, My heart rejoiceth in Thy salvation.",
    },
  },
  {
    ref: "Psalm 32:7",
    versions: {
      KJV: "Thou art my hiding place; thou shalt preserve me from trouble; thou shalt compass me about with songs of deliverance.",
      WEB: "You are my hiding place. You will preserve me from trouble. You will surround me with songs of deliverance.",
      ASV: "Thou art my hiding-place; thou wilt preserve me from trouble; Thou wilt compass me about with songs of deliverance.",
      YLT: "Thou art a hiding place for me, From distress Thou keepest me, With songs of deliverance dost compass me. Selah.",
    },
  },
  {
    ref: "Psalm 34:4",
    versions: {
      KJV: "I sought the LORD, and he heard me, and delivered me from all my fears.",
      WEB: "I sought Yahweh, and he answered me, and delivered me from all my fears.",
      ASV: "I sought Jehovah, and he answered me, And delivered me from all my fears.",
      YLT: "I sought Jehovah, and He answered me, And from all my fears He delivered me.",
    },
  },
  {
    ref: "Psalm 34:7",
    versions: {
      KJV: "The angel of the LORD encampeth round about them that fear him, and delivereth them.",
      WEB: "Yahweh's angel encamps around those who fear him, and delivers them.",
      ASV: "The angel of Jehovah encampeth round about them that fear him, And delivereth them.",
      YLT: "A messenger of Jehovah is encamping Round about those fearing Him, And He armeth them.",
    },
  },
  {
    ref: "Psalm 34:19",
    versions: {
      KJV: "Many are the afflictions of the righteous: but the LORD delivereth him out of them all.",
      WEB: "Many are the afflictions of the righteous, but Yahweh delivers him out of them all.",
      ASV: "Many are the afflictions of the righteous; But Jehovah delivereth him out of them all.",
      YLT: "Many are the evils of the righteous, And out of all them doth Jehovah deliver him.",
    },
  },
  {
    ref: "Psalm 37:39",
    versions: {
      KJV: "But the salvation of the righteous is of the LORD: he is their strength in the time of trouble.",
      WEB: "But the salvation of the righteous is from Yahweh. He is their stronghold in the time of trouble.",
      ASV: "But the salvation of the righteous is of Jehovah: He is their stronghold in the time of trouble.",
      YLT: "And the salvation of the righteous is from Jehovah, Their strong place in time of adversity.",
    },
  },
  {
    ref: "Psalm 37:5",
    versions: {
      KJV: "Commit thy way unto the LORD; trust also in him; and he shall bring it to pass.",
      WEB: "Commit your way to Yahweh. Trust also in him, and he will do this:",
      ASV: "Commit thy way unto Jehovah; Trust also in him, and he will bring it to pass.",
      YLT: "Roll on Jehovah thy way, and trust upon Him, And He doth work,",
    },
  },
  {
    ref: "Psalm 37:37",
    versions: {
      KJV: "Mark the perfect man, and behold the upright: for the end of that man is peace.",
      WEB: "Mark the perfect man, and see the upright, for there is a future for the man of peace.",
      ASV: "Mark the perfect man, and behold the upright; For there is a happy end to the man of peace.",
      YLT: "Observe the perfect, and behold the upright, For the latter end of each is peace.",
    },
  },
  {
    ref: "Psalm 41:1",
    versions: {
      KJV: "Blessed is he that considereth the poor: the LORD will deliver him in time of trouble.",
      WEB: "Blessed is he who considers the poor. Yahweh will deliver him in the day of evil.",
      ASV: "Blessed is he that considereth the poor: Jehovah will deliver him in the day of evil.",
      YLT: "O the happiness of him -- Considering the poor, In a day of evil Jehovah delivereth him.",
    },
  },
  {
    ref: "Psalm 46:1-2",
    versions: {
      KJV: "God is our refuge and strength, a very present help in trouble. Therefore will not we fear.",
      WEB: "God is our refuge and strength, a very present help in trouble. Therefore we will not be afraid,",
      ASV: "God is our refuge and strength, A very present help in trouble. Therefore will we not fear,",
      YLT: "God is to us a refuge and strength, A help in adversities found most surely. Therefore we fear not in the changing of earth,",
    },
  },
  {
    ref: "Psalm 46:11",
    versions: {
      KJV: "The LORD of hosts is with us; the God of Jacob is our refuge.",
      WEB: "Yahweh of Armies is with us. The God of Jacob is our refuge.",
      ASV: "Jehovah of hosts is with us; The God of Jacob is our refuge.",
      YLT: "Jehovah of Hosts is with us, A tower for us is the God of Jacob. Selah.",
    },
  },
];
