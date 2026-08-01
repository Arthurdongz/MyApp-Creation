// 366 scripture verses on hope, encouragement, comfort, joy, peace, and strength —
// one for every day of the year, including a leap day, with no repeats.
//
// Each entry now carries the same reference in two public-domain
// translations: the King James Version (KJV, 1611/1769) and the World
// English Bible (WEB) — a modern, plain-English, public-domain translation,
// picked as the readable/"easy to understand" option since it carries no
// licensing restrictions the way NLT/MSG/TPT/TLB do. Settings let a user
// either alternate between the two day to day, or pin a single favorite
// version for every verse.
//
// Text is compiled from training knowledge in an offline environment with
// no live Bible-database access to verify against (attempted and blocked
// by this environment's network policy) — treat this as a good-faith first
// draft, not a certified-accurate transcription. A handful of verses with
// genuine textual variants between translations (e.g. Job 13:15) required a
// judgment call on which reading to follow. Two pre-existing errors in the
// original KJV-only version of this file were caught and corrected while
// adding WEB: Proverbs 12:25 had non-KJV wording, and the entry labeled
// "2 John 1:6" actually contained 1 Peter 1:8's text (fixed to the real,
// and correctly attributed, 2 John 1:3). Spot-check before relying on this
// beyond personal devotional use.

const BIBLE_VERSIONS = [
  { id: "KJV", name: "King James Version" },
  { id: "WEB", name: "World English Bible" },
];

const VERSES = [
  {
    ref: "Genesis 1:3",
    versions: {
      KJV: "And God said, Let there be light: and there was light.",
      WEB: "God said, \"Let there be light,\" and there was light.",
    },
  },
  {
    ref: "Genesis 1:27",
    versions: {
      KJV: "So God created man in his own image, in the image of God created he him.",
      WEB: "God created man in his own image. In God's image he created him;",
    },
  },
  {
    ref: "Genesis 50:20",
    versions: {
      KJV: "But as for you, ye thought evil against me; but God meant it unto good.",
      WEB: "As for you, you meant evil against me, but God meant it for good,",
    },
  },
  {
    ref: "Exodus 14:14",
    versions: {
      KJV: "The LORD shall fight for you, and ye shall hold your peace.",
      WEB: "Yahweh will fight for you, and you shall be still.",
    },
  },
  {
    ref: "Exodus 15:2",
    versions: {
      KJV: "The LORD is my strength and song, and he is become my salvation.",
      WEB: "Yah is my strength and song. He has become my salvation.",
    },
  },
  {
    ref: "Deuteronomy 31:8",
    versions: {
      KJV: "And the LORD, he it is that doth go before thee; he will be with thee, he will not fail thee, neither forsake thee: fear not, neither be dismayed.",
      WEB: "Yahweh himself is who goes before you. He will be with you. He will not fail you nor forsake you. Don't be afraid. Don't be discouraged.",
    },
  },
  {
    ref: "Numbers 6:24-26",
    versions: {
      KJV: "The LORD bless thee, and keep thee: the LORD make his face shine upon thee, and be gracious unto thee: the LORD lift up his countenance upon thee, and give thee peace.",
      WEB: "Yahweh bless you, and keep you. Yahweh make his face to shine on you, and be gracious to you. Yahweh lift up his face toward you, and give you peace.",
    },
  },
  {
    ref: "Deuteronomy 31:6",
    versions: {
      KJV: "Be strong and of a good courage, fear not, nor be afraid of them: for the LORD thy God, he it is that doth go with thee.",
      WEB: "Be strong and courageous. Don't be afraid or scared of them, for Yahweh your God himself is who goes with you.",
    },
  },
  {
    ref: "Deuteronomy 33:27",
    versions: {
      KJV: "The eternal God is thy refuge, and underneath are the everlasting arms.",
      WEB: "The eternal God is your dwelling place. Underneath are the everlasting arms.",
    },
  },
  {
    ref: "Deuteronomy 30:15",
    versions: {
      KJV: "See, I have set before thee this day life and good, and death and evil.",
      WEB: "Behold, I have set before you today life and good, and death and evil.",
    },
  },
  {
    ref: "Joshua 1:9",
    versions: {
      KJV: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      WEB: "Haven't I commanded you? Be strong and courageous. Don't be afraid. Don't be dismayed, for Yahweh your God is with you wherever you go.",
    },
  },
  {
    ref: "Joshua 1:5",
    versions: {
      KJV: "There shall not any man be able to stand before thee all the days of thy life.",
      WEB: "No man will be able to stand before you all the days of your life.",
    },
  },
  {
    ref: "Joshua 24:15",
    versions: {
      KJV: "Choose you this day whom ye will serve... but as for me and my house, we will serve the LORD.",
      WEB: "Choose today whom you will serve... but as for me and my house, we will serve Yahweh.",
    },
  },
  {
    ref: "Judges 6:12",
    versions: {
      KJV: "The LORD is with thee, thou mighty man of valour.",
      WEB: "Yahweh is with you, you mighty man of valor.",
    },
  },
  {
    ref: "Ruth 1:16",
    versions: {
      KJV: "Whither thou goest, I will go... thy people shall be my people, and thy God my God.",
      WEB: "Where you go, I will go... your people will be my people, and your God my God.",
    },
  },
  {
    ref: "1 Samuel 3:9",
    versions: {
      KJV: "Speak, LORD; for thy servant heareth.",
      WEB: "Speak, Yahweh; for your servant hears.",
    },
  },
  {
    ref: "1 Samuel 16:7",
    versions: {
      KJV: "The LORD looketh on the heart.",
      WEB: "Yahweh looks at the heart.",
    },
  },
  {
    ref: "Psalm 119:105",
    versions: {
      KJV: "Thy word is a lamp unto my feet, and a light unto my path.",
      WEB: "Your word is a lamp to my feet, and a light for my path.",
    },
  },
  {
    ref: "1 Kings 19:12",
    versions: {
      KJV: "And after the fire a still small voice.",
      WEB: "After the fire, a still small voice.",
    },
  },
  {
    ref: "Nehemiah 8:10",
    versions: {
      KJV: "The joy of the LORD is your strength.",
      WEB: "The joy of Yahweh is your strength.",
    },
  },
  {
    ref: "1 Chronicles 28:20",
    versions: {
      KJV: "Be strong and of good courage, dread not, nor be dismayed: for the LORD God, even my God, will be with thee.",
      WEB: "Be strong and courageous, and do it. Don't be afraid, nor be dismayed; for Yahweh God, even my God, is with you.",
    },
  },
  {
    ref: "2 Chronicles 7:14",
    versions: {
      KJV: "If my people, which are called by my name, shall humble themselves, and pray, and seek my face... then will I hear from heaven, and will forgive their sin, and will heal their land.",
      WEB: "If my people, who are called by my name, will humble themselves, pray, and seek my face... then I will hear from heaven, forgive their sin, and heal their land.",
    },
  },
  {
    ref: "2 Chronicles 20:15",
    versions: {
      KJV: "The battle is not yours, but God's.",
      WEB: "The battle is not yours, but God's.",
    },
  },
  {
    ref: "Ezra 8:22",
    versions: {
      KJV: "The hand of our God is upon all them for good that seek him.",
      WEB: "The hand of our God is on all those who seek him, for good.",
    },
  },
  {
    ref: "Esther 4:14",
    versions: {
      KJV: "And who knoweth whether thou art come to the kingdom for such a time as this?",
      WEB: "Who knows whether you haven't come to the kingdom for such a time as this?",
    },
  },
  {
    ref: "Job 19:25",
    versions: {
      KJV: "For I know that my redeemer liveth, and that he shall stand at the latter day upon the earth.",
      WEB: "But as for me, I know that my Redeemer lives. In the end, he will stand upon the earth.",
    },
  },
  {
    ref: "Job 38:4",
    versions: {
      KJV: "Where wast thou when I laid the foundations of the earth?",
      WEB: "Where were you when I laid the foundations of the earth?",
    },
  },
  {
    ref: "Job 42:5",
    versions: {
      KJV: "I have heard of thee by the hearing of the ear: but now mine eye seeth thee.",
      WEB: "I had heard of you by the hearing of the ear, but now my eye sees you.",
    },
  },
  {
    ref: "Job 13:15",
    versions: {
      KJV: "Though he slay me, yet will I trust in him.",
      WEB: "Though he kills me, I will hope in him.",
    },
  },
  {
    ref: "Job 14:1",
    versions: {
      KJV: "Man that is born of a woman is of few days, and full of trouble.",
      WEB: "Man who is born of a woman is of few days, and full of trouble.",
    },
  },
  {
    ref: "Psalm 23:1",
    versions: {
      KJV: "The LORD is my shepherd; I shall not want.",
      WEB: "Yahweh is my shepherd; I shall lack nothing.",
    },
  },
  {
    ref: "Psalm 23:3",
    versions: {
      KJV: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
      WEB: "He restores my soul. He guides me in the paths of righteousness for his name's sake.",
    },
  },
  {
    ref: "Psalm 23:4",
    versions: {
      KJV: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me.",
      WEB: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.",
    },
  },
  {
    ref: "Psalm 23:6",
    versions: {
      KJV: "Surely goodness and mercy shall follow me all the days of my life.",
      WEB: "Surely goodness and loving kindness shall follow me all the days of my life.",
    },
  },
  {
    ref: "Psalm 30:5",
    versions: {
      KJV: "Weeping may endure for a night, but joy cometh in the morning.",
      WEB: "Weeping may stay for the night, but joy comes in the morning.",
    },
  },
  {
    ref: "Psalm 30:11",
    versions: {
      KJV: "Thou hast turned for me my mourning into dancing.",
      WEB: "You have turned my mourning into dancing for me.",
    },
  },
  {
    ref: "Psalm 31:24",
    versions: {
      KJV: "Be of good courage, and he shall strengthen thine heart, all ye that hope in the LORD.",
      WEB: "Be strong, and let your heart take courage, all you who hope in Yahweh.",
    },
  },
  {
    ref: "Psalm 34:18",
    versions: {
      KJV: "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.",
      WEB: "Yahweh is near to those who have a broken heart, and saves those who have a crushed spirit.",
    },
  },
  {
    ref: "Psalm 34:8",
    versions: {
      KJV: "O taste and see that the LORD is good: blessed is the man that trusteth in him.",
      WEB: "Oh taste and see that Yahweh is good. Blessed is the man who takes refuge in him.",
    },
  },
  {
    ref: "Psalm 34:6",
    versions: {
      KJV: "This poor man cried, and the LORD heard him, and saved him out of all his troubles.",
      WEB: "This poor man cried, and Yahweh heard him, and saved him out of all his troubles.",
    },
  },
  {
    ref: "Psalm 37:4",
    versions: {
      KJV: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.",
      WEB: "Also delight yourself in Yahweh, and he will give you the desires of your heart.",
    },
  },
  {
    ref: "Psalm 37:7",
    versions: {
      KJV: "Rest in the LORD, and wait patiently for him.",
      WEB: "Rest in Yahweh, and wait patiently for him.",
    },
  },
  {
    ref: "Psalm 37:25",
    versions: {
      KJV: "I have been young, and now am old; yet have I not seen the righteous forsaken.",
      WEB: "I have been young, and now am old, yet I have not seen the righteous forsaken.",
    },
  },
  {
    ref: "Psalm 46:1",
    versions: {
      KJV: "God is our refuge and strength, a very present help in trouble.",
      WEB: "God is our refuge and strength, a very present help in trouble.",
    },
  },
  {
    ref: "Psalm 46:10",
    versions: {
      KJV: "Be still, and know that I am God.",
      WEB: "Be still, and know that I am God.",
    },
  },
  {
    ref: "Psalm 51:10",
    versions: {
      KJV: "Create in me a clean heart, O God; and renew a right spirit within me.",
      WEB: "Create in me a clean heart, O God. Renew a right spirit within me.",
    },
  },
  {
    ref: "Psalm 55:22",
    versions: {
      KJV: "Cast thy burden upon the LORD, and he shall sustain thee.",
      WEB: "Cast your burden on Yahweh, and he will sustain you.",
    },
  },
  {
    ref: "Psalm 56:3",
    versions: {
      KJV: "What time I am afraid, I will trust in thee.",
      WEB: "When I am afraid, I will put my trust in you.",
    },
  },
  {
    ref: "Psalm 56:8",
    versions: {
      KJV: "Thou tellest my wanderings: put thou my tears into thy bottle.",
      WEB: "You number my wanderings. You put my tears into your bottle.",
    },
  },
  {
    ref: "Psalm 62:5",
    versions: {
      KJV: "My soul, wait thou only upon God; for my expectation is from him.",
      WEB: "My soul, wait in silence for God alone, for my expectation is from him.",
    },
  },
  {
    ref: "Psalm 94:19",
    versions: {
      KJV: "In the multitude of my thoughts within me thy comforts delight my soul.",
      WEB: "In the multitude of my thoughts within me, your comforts delight my soul.",
    },
  },
  {
    ref: "Psalm 95:1",
    versions: {
      KJV: "O come, let us sing unto the LORD: let us make a joyful noise to the rock of our salvation.",
      WEB: "Oh come, let's sing to Yahweh. Let's shout aloud to the rock of our salvation.",
    },
  },
  {
    ref: "Psalm 100:1",
    versions: {
      KJV: "Make a joyful noise unto the LORD, all ye lands.",
      WEB: "Shout for joy to Yahweh, all you lands!",
    },
  },
  {
    ref: "Psalm 100:4",
    versions: {
      KJV: "Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.",
      WEB: "Enter into his gates with thanksgiving, and into his courts with praise. Give thanks to him, and bless his name.",
    },
  },
  {
    ref: "Psalm 103:3",
    versions: {
      KJV: "Who forgiveth all thine iniquities; who healeth all thy diseases.",
      WEB: "Who forgives all your sins, who heals all your diseases,",
    },
  },
  {
    ref: "Psalm 103:12",
    versions: {
      KJV: "As far as the east is from the west, so far hath he removed our transgressions from us.",
      WEB: "As far as the east is from the west, so far has he removed our transgressions from us.",
    },
  },
  {
    ref: "Psalm 103:13",
    versions: {
      KJV: "Like as a father pitieth his children, so the LORD pitieth them that fear him.",
      WEB: "Like a father has compassion on his children, so Yahweh has compassion on those who fear him.",
    },
  },
  {
    ref: "Psalm 103:2",
    versions: {
      KJV: "Bless the LORD, O my soul, and forget not all his benefits.",
      WEB: "Bless Yahweh, my soul, and don't forget all his benefits,",
    },
  },
  {
    ref: "Psalm 147:3",
    versions: {
      KJV: "He healeth the broken in heart, and bindeth up their wounds.",
      WEB: "He heals the broken in heart, and binds up their wounds.",
    },
  },
  {
    ref: "Psalm 147:4",
    versions: {
      KJV: "He telleth the number of the stars; he calleth them all by their names.",
      WEB: "He counts the number of the stars. He calls them all by their names.",
    },
  },
  {
    ref: "Psalm 118:24",
    versions: {
      KJV: "This is the day which the LORD hath made; we will rejoice and be glad in it.",
      WEB: "This is the day that Yahweh has made. We will rejoice and be glad in it!",
    },
  },
  {
    ref: "Psalm 118:8",
    versions: {
      KJV: "It is better to trust in the LORD than to put confidence in man.",
      WEB: "It is better to take refuge in Yahweh than to put confidence in man.",
    },
  },
  {
    ref: "Psalm 118:14",
    versions: {
      KJV: "The LORD is my strength and song, and is become my salvation.",
      WEB: "Yah is my strength and song. He has become my salvation.",
    },
  },
  {
    ref: "Psalm 121:1",
    versions: {
      KJV: "I will lift up mine eyes unto the hills, from whence cometh my help.",
      WEB: "I will lift up my eyes to the hills. Where does my help come from?",
    },
  },
  {
    ref: "Psalm 121:2",
    versions: {
      KJV: "My help cometh from the LORD, which made heaven and earth.",
      WEB: "My help comes from Yahweh, who made heaven and earth.",
    },
  },
  {
    ref: "Psalm 121:7",
    versions: {
      KJV: "The LORD shall preserve thee from all evil: he shall preserve thy soul.",
      WEB: "Yahweh will keep you from all evil. He will keep your soul.",
    },
  },
  {
    ref: "Psalm 126:5",
    versions: {
      KJV: "They that sow in tears shall reap in joy.",
      WEB: "Those who sow in tears will reap in joy.",
    },
  },
  {
    ref: "Psalm 127:1",
    versions: {
      KJV: "Except the LORD build the house, they labour in vain that build it.",
      WEB: "Unless Yahweh builds the house, they who build it labor in vain.",
    },
  },
  {
    ref: "Psalm 139:14",
    versions: {
      KJV: "I will praise thee; for I am fearfully and wonderfully made.",
      WEB: "I will give thanks to you, for I am fearfully and wonderfully made.",
    },
  },
  {
    ref: "Psalm 139:7",
    versions: {
      KJV: "Whither shall I go from thy spirit? or whither shall I flee from thy presence?",
      WEB: "Where could I go from your Spirit? Or where could I flee from your presence?",
    },
  },
  {
    ref: "Psalm 139:23",
    versions: {
      KJV: "Search me, O God, and know my heart: try me, and know my thoughts.",
      WEB: "Search me, God, and know my heart. Try me, and know my thoughts.",
    },
  },
  {
    ref: "Psalm 139:10",
    versions: {
      KJV: "Even there shall thy hand lead me, and thy right hand shall hold me.",
      WEB: "Even there your hand will lead me, and your right hand will hold me.",
    },
  },
  {
    ref: "Psalm 145:8",
    versions: {
      KJV: "The LORD is gracious, and full of compassion; slow to anger, and of great mercy.",
      WEB: "Yahweh is gracious, merciful, slow to anger, and of great loving kindness.",
    },
  },
  {
    ref: "Psalm 145:18",
    versions: {
      KJV: "The LORD is nigh unto all them that call upon him, to all that call upon him in truth.",
      WEB: "Yahweh is near to all those who call on him, to all who call on him in truth.",
    },
  },
  {
    ref: "Psalm 145:14",
    versions: {
      KJV: "The LORD upholdeth all that fall, and raiseth up all those that be bowed down.",
      WEB: "Yahweh upholds all who fall, and raises up all those who are bowed down.",
    },
  },
  {
    ref: "Psalm 147:1",
    versions: {
      KJV: "Praise ye the LORD: for it is good to sing praises unto our God; for it is pleasant, and praise is comely.",
      WEB: "Praise Yah! For it is good to sing praises to our God, for it is pleasant and fitting to praise him.",
    },
  },
  {
    ref: "Psalm 147:11",
    versions: {
      KJV: "The LORD taketh pleasure in them that fear him, in those that hope in his mercy.",
      WEB: "Yahweh takes pleasure in those who fear him, in those who hope in his loving kindness.",
    },
  },
  {
    ref: "Psalm 16:11",
    versions: {
      KJV: "In thy presence is fulness of joy; at thy right hand there are pleasures for evermore.",
      WEB: "In your presence is fullness of joy. In your right hand there are pleasures forever more.",
    },
  },
  {
    ref: "Psalm 16:8",
    versions: {
      KJV: "I have set the LORD always before me: because he is at my right hand, I shall not be moved.",
      WEB: "I have set Yahweh always before me. Because he is at my right hand, I shall not be moved.",
    },
  },
  {
    ref: "Psalm 16:6",
    versions: {
      KJV: "The lines are fallen unto me in pleasant places; yea, I have a goodly heritage.",
      WEB: "The lines have fallen to me in pleasant places. Yes, I have a good inheritance.",
    },
  },
  {
    ref: "Psalm 16:1",
    versions: {
      KJV: "Preserve me, O God: for in thee do I put my trust.",
      WEB: "Preserve me, God, for in you do I put my trust.",
    },
  },
  {
    ref: "Psalm 27:1",
    versions: {
      KJV: "The LORD is my light and my salvation; whom shall I fear?",
      WEB: "Yahweh is my light and my salvation. Whom shall I fear?",
    },
  },
  {
    ref: "Psalm 27:14",
    versions: {
      KJV: "Wait on the LORD: be of good courage, and he shall strengthen thine heart.",
      WEB: "Wait for Yahweh. Be strong, and let your heart take courage. Yes, wait for Yahweh.",
    },
  },
  {
    ref: "Psalm 27:10",
    versions: {
      KJV: "When my father and my mother forsake me, then the LORD will take me up.",
      WEB: "When my father and my mother forsake me, then Yahweh will take me up.",
    },
  },
  {
    ref: "Psalm 27:13",
    versions: {
      KJV: "I had fainted, unless I had believed to see the goodness of the LORD in the land of the living.",
      WEB: "I am still confident of this: I will see the goodness of Yahweh in the land of the living.",
    },
  },
  {
    ref: "Psalm 18:2",
    versions: {
      KJV: "The LORD is my rock, and my fortress, and my deliverer.",
      WEB: "Yahweh is my rock, my fortress, and my deliverer;",
    },
  },
  {
    ref: "Psalm 18:19",
    versions: {
      KJV: "He brought me forth also into a large place: he delivered me, because he delighted in me.",
      WEB: "He brought me out also into a large place. He delivered me, because he delighted in me.",
    },
  },
  {
    ref: "Psalm 18:6",
    versions: {
      KJV: "In my distress I called upon the LORD... he heard my voice out of his temple.",
      WEB: "In my distress I called on Yahweh... he heard my voice out of his temple,",
    },
  },
  {
    ref: "Psalm 19:1",
    versions: {
      KJV: "The heavens declare the glory of God; and the firmament sheweth his handywork.",
      WEB: "The heavens declare the glory of God. The expanse shows his handiwork.",
    },
  },
  {
    ref: "Psalm 19:14",
    versions: {
      KJV: "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD.",
      WEB: "Let the words of my mouth and the meditation of my heart be acceptable in your sight, Yahweh,",
    },
  },
  {
    ref: "Psalm 20:7",
    versions: {
      KJV: "Some trust in chariots, and some in horses: but we will remember the name of the LORD our God.",
      WEB: "Some trust in chariots, and some in horses, but we trust the name of Yahweh our God.",
    },
  },
  {
    ref: "Psalm 37:1",
    versions: {
      KJV: "Fret not thyself because of evildoers, neither be thou envious against the workers of iniquity.",
      WEB: "Don't fret because of evildoers, neither be envious against those who do unrighteousness.",
    },
  },
  {
    ref: "Psalm 37:23",
    versions: {
      KJV: "The steps of a good man are ordered by the LORD: and he delighteth in his way.",
      WEB: "A man's steps are established by Yahweh. He delights in his way.",
    },
  },
  {
    ref: "Psalm 40:1",
    versions: {
      KJV: "I waited patiently for the LORD; and he inclined unto me, and heard my cry.",
      WEB: "I waited patiently for Yahweh. He turned to me, and heard my cry.",
    },
  },
  {
    ref: "Psalm 40:2",
    versions: {
      KJV: "He brought me up also out of an horrible pit, out of the miry clay, and set my feet upon a rock.",
      WEB: "He brought me up also out of a horrible pit, out of the miry clay. He set my feet on a rock, and gave me a firm place to stand.",
    },
  },
  {
    ref: "Psalm 40:3",
    versions: {
      KJV: "And he hath put a new song in my mouth, even praise unto our God.",
      WEB: "He has put a new song in my mouth, even praise to our God.",
    },
  },
  {
    ref: "Psalm 42:1",
    versions: {
      KJV: "As the hart panteth after the water brooks, so panteth my soul after thee, O God.",
      WEB: "As the deer pants for the water brooks, so my soul pants after you, God.",
    },
  },
  {
    ref: "Psalm 42:11",
    versions: {
      KJV: "Why art thou cast down, O my soul? and why art thou disquieted in me? hope thou in God.",
      WEB: "Why are you in despair, my soul? Why are you disturbed within me? Hope in God!",
    },
  },
  {
    ref: "Psalm 46:2",
    versions: {
      KJV: "God is our refuge and strength, therefore will not we fear, though the earth be removed.",
      WEB: "God is our refuge and strength, therefore we will not be afraid, though the earth changes,",
    },
  },
  {
    ref: "Psalm 46:4",
    versions: {
      KJV: "There is a river, the streams whereof shall make glad the city of God.",
      WEB: "There is a river, the streams of which make the city of God glad,",
    },
  },
  {
    ref: "Jeremiah 17:7",
    versions: {
      KJV: "Blessed is the man that trusteth in the LORD, and whose hope the LORD is.",
      WEB: "Blessed is the man who trusts in Yahweh, and whose confidence is in Yahweh.",
    },
  },
  {
    ref: "Proverbs 3:5",
    versions: {
      KJV: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
      WEB: "Trust in Yahweh with all your heart, and don't lean on your own understanding.",
    },
  },
  {
    ref: "Proverbs 3:6",
    versions: {
      KJV: "In all thy ways acknowledge him, and he shall direct thy paths.",
      WEB: "In all your ways acknowledge him, and he will make your paths straight.",
    },
  },
  {
    ref: "Proverbs 17:22",
    versions: {
      KJV: "A merry heart doeth good like a medicine.",
      WEB: "A cheerful heart makes good medicine,",
    },
  },
  {
    ref: "Proverbs 12:25",
    versions: {
      KJV: "Heaviness in the heart of man maketh it stoop: but a good word maketh it glad.",
      WEB: "Heaviness in the heart of man weighs it down, but a good word makes it glad.",
    },
  },
  {
    ref: "Proverbs 16:24",
    versions: {
      KJV: "Pleasant words are as an honeycomb, sweet to the soul, and health to the bones.",
      WEB: "Pleasant words are a honeycomb, sweet to the soul, and health to the bones.",
    },
  },
  {
    ref: "Proverbs 15:1",
    versions: {
      KJV: "A soft answer turneth away wrath: but grievous words stir up anger.",
      WEB: "A gentle answer turns away wrath, but a harsh word stirs up anger.",
    },
  },
  {
    ref: "Proverbs 18:10",
    versions: {
      KJV: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
      WEB: "Yahweh's name is a strong tower: the righteous run to him, and are safe.",
    },
  },
  {
    ref: "Proverbs 18:24",
    versions: {
      KJV: "There is a friend that sticketh closer than a brother.",
      WEB: "There is a friend who sticks closer than a brother.",
    },
  },
  {
    ref: "Proverbs 27:17",
    versions: {
      KJV: "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.",
      WEB: "Iron sharpens iron; so a man sharpens his friend's countenance.",
    },
  },
  {
    ref: "Proverbs 27:19",
    versions: {
      KJV: "As in water face answereth to face, so the heart of man to man.",
      WEB: "As water reflects a face, so a man's heart reflects the man.",
    },
  },
  {
    ref: "Proverbs 27:9",
    versions: {
      KJV: "Ointment and perfume rejoice the heart: so doth the sweetness of a man's friend by hearty counsel.",
      WEB: "Perfume and incense bring joy to the heart; so does earnest counsel from a man's friend.",
    },
  },
  {
    ref: "Ecclesiastes 4:9",
    versions: {
      KJV: "Two are better than one; because they have a good reward for their labour.",
      WEB: "Two are better than one, because they have a good reward for their labor.",
    },
  },
  {
    ref: "Ecclesiastes 4:10",
    versions: {
      KJV: "For if they fall, the one will lift up his fellow.",
      WEB: "For if they fall, the one will lift up his fellow;",
    },
  },
  {
    ref: "Ecclesiastes 4:12",
    versions: {
      KJV: "And a threefold cord is not quickly broken.",
      WEB: "A three-fold cord is not quickly broken.",
    },
  },
  {
    ref: "Ecclesiastes 3:1",
    versions: {
      KJV: "To every thing there is a season, and a time to every purpose under the heaven.",
      WEB: "For everything there is a season, and a time for every purpose under heaven:",
    },
  },
  {
    ref: "Ecclesiastes 3:11",
    versions: {
      KJV: "He hath made every thing beautiful in his time.",
      WEB: "He has made everything beautiful in its time.",
    },
  },
  {
    ref: "Song of Solomon 8:7",
    versions: {
      KJV: "Many waters cannot quench love, neither can the floods drown it.",
      WEB: "Many waters can't quench love, neither can floods drown it.",
    },
  },
  {
    ref: "Isaiah 40:31",
    versions: {
      KJV: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.",
      WEB: "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles.",
    },
  },
  {
    ref: "Isaiah 40:29",
    versions: {
      KJV: "He giveth power to the faint; and to them that have no might he increaseth strength.",
      WEB: "He gives power to the weak. He increases the strength of him who has no might.",
    },
  },
  {
    ref: "Isaiah 40:1",
    versions: {
      KJV: "Comfort ye, comfort ye my people, saith your God.",
      WEB: "Comfort, comfort my people, says your God.",
    },
  },
  {
    ref: "Isaiah 40:11",
    versions: {
      KJV: "He shall feed his flock like a shepherd: he shall gather the lambs with his arm.",
      WEB: "He will feed his flock like a shepherd. He will gather the lambs in his arm,",
    },
  },
  {
    ref: "Isaiah 41:10",
    versions: {
      KJV: "Fear thou not; for I am with thee: be not dismayed; for I am thy God.",
      WEB: "Don't you be afraid, for I am with you. Don't be dismayed, for I am your God.",
    },
  },
  {
    ref: "Isaiah 43:2",
    versions: {
      KJV: "When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee.",
      WEB: "When you pass through the waters, I will be with you, and through the rivers, they will not overwhelm you.",
    },
  },
  {
    ref: "Isaiah 43:1",
    versions: {
      KJV: "Fear not: for I have redeemed thee, I have called thee by thy name; thou art mine.",
      WEB: "Don't be afraid, for I have redeemed you. I have called you by your name. You are mine.",
    },
  },
  {
    ref: "Isaiah 51:12",
    versions: {
      KJV: "I, even I, am he that comforteth you.",
      WEB: "I, even I, am he who comforts you.",
    },
  },
  {
    ref: "Isaiah 52:7",
    versions: {
      KJV: "How beautiful upon the mountains are the feet of him that bringeth good tidings.",
      WEB: "How beautiful on the mountains are the feet of him who brings good news,",
    },
  },
  {
    ref: "Isaiah 55:12",
    versions: {
      KJV: "For ye shall go out with joy, and be led forth with peace.",
      WEB: "For you shall go out with joy, and be led out with peace.",
    },
  },
  {
    ref: "Isaiah 55:8",
    versions: {
      KJV: "For my thoughts are not your thoughts, neither are your ways my ways, saith the LORD.",
      WEB: "For my thoughts are not your thoughts, neither are your ways my ways, says Yahweh.",
    },
  },
  {
    ref: "Isaiah 55:6",
    versions: {
      KJV: "Seek ye the LORD while he may be found, call ye upon him while he is near.",
      WEB: "Seek Yahweh while he may be found. Call on him while he is near.",
    },
  },
  {
    ref: "Isaiah 61:1-2",
    versions: {
      KJV: "The Spirit of the Lord GOD is upon me... to comfort all that mourn.",
      WEB: "The Spirit of the Lord Yahweh is on me... to comfort all who mourn,",
    },
  },
  {
    ref: "Isaiah 61:3",
    versions: {
      KJV: "To appoint unto them that mourn in Zion, to give unto them beauty for ashes, the oil of joy for mourning.",
      WEB: "to provide for those who mourn in Zion, to give to them a garland for ashes, the oil of joy for mourning,",
    },
  },
  {
    ref: "Isaiah 66:13",
    versions: {
      KJV: "As one whom his mother comforteth, so will I comfort you.",
      WEB: "As one whom his mother comforts, so I will comfort you.",
    },
  },
  {
    ref: "Isaiah 63:9",
    versions: {
      KJV: "In all their affliction he was afflicted, and the angel of his presence saved them.",
      WEB: "In all their affliction he was afflicted, and the angel of his presence saved them.",
    },
  },
  {
    ref: "Isaiah 26:3",
    versions: {
      KJV: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
      WEB: "You will keep whoever's mind is steadfast on you in perfect peace, because he trusts in you.",
    },
  },
  {
    ref: "Isaiah 26:4",
    versions: {
      KJV: "Trust ye in the LORD for ever: for in the LORD JEHOVAH is everlasting strength.",
      WEB: "Trust in Yahweh forever, for in Yah, Yahweh, is an everlasting Rock.",
    },
  },
  {
    ref: "Isaiah 42:3",
    versions: {
      KJV: "A bruised reed shall he not break, and the smoking flax shall he not quench.",
      WEB: "He won't break a bruised reed. He won't quench a dimly burning wick.",
    },
  },
  {
    ref: "Isaiah 12:2",
    versions: {
      KJV: "Behold, God is my salvation; I will trust, and not be afraid.",
      WEB: "Behold, God is my salvation. I will trust, and will not be afraid,",
    },
  },
  {
    ref: "Isaiah 12:3",
    versions: {
      KJV: "With joy shall ye draw water out of the wells of salvation.",
      WEB: "Therefore with joy you will draw water out of the wells of salvation.",
    },
  },
  {
    ref: "Isaiah 9:2",
    versions: {
      KJV: "The people that walked in darkness have seen a great light.",
      WEB: "The people who walked in darkness have seen a great light.",
    },
  },
  {
    ref: "Isaiah 9:6",
    versions: {
      KJV: "For unto us a child is born, unto us a son is given... and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace.",
      WEB: "For a child is born to us. A son is given to us... and his name will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.",
    },
  },
  {
    ref: "Isaiah 9:7",
    versions: {
      KJV: "Of the increase of his government and peace there shall be no end.",
      WEB: "Of the increase of his government and of his peace there shall be no end,",
    },
  },
  {
    ref: "Jeremiah 29:11",
    versions: {
      KJV: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
      WEB: "For I know the thoughts that I think toward you, says Yahweh, thoughts of peace, and not of evil, to give you hope and a future.",
    },
  },
  {
    ref: "Jeremiah 29:12",
    versions: {
      KJV: "Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto you.",
      WEB: "Then you shall call on me, and you shall go and pray to me, and I will listen to you.",
    },
  },
  {
    ref: "Jeremiah 29:13",
    versions: {
      KJV: "And ye shall seek me, and find me, when ye shall search for me with all your heart.",
      WEB: "You shall seek me, and find me, when you search for me with all your heart.",
    },
  },
  {
    ref: "Jeremiah 17:7-8",
    versions: {
      KJV: "Blessed is the man that trusteth in the LORD, and whose hope the LORD is. For he shall be as a tree planted by the waters.",
      WEB: "Blessed is the man who trusts in Yahweh, and whose confidence is in Yahweh. For he will be as a tree planted by the waters,",
    },
  },
  {
    ref: "Jeremiah 32:27",
    versions: {
      KJV: "Is any thing too hard for me?",
      WEB: "Is there anything too hard for me?",
    },
  },
  {
    ref: "Jeremiah 33:3",
    versions: {
      KJV: "Call unto me, and I will answer thee, and shew thee great and mighty things, which thou knowest not.",
      WEB: "Call to me, and I will answer you, and will show you great and difficult things, which you don't know.",
    },
  },
  {
    ref: "Jeremiah 31:3",
    versions: {
      KJV: "I have loved thee with an everlasting love: therefore with lovingkindness have I drawn thee.",
      WEB: "I have loved you with an everlasting love; therefore I have drawn you with loving kindness.",
    },
  },
  {
    ref: "Lamentations 3:22",
    versions: {
      KJV: "It is of the LORD's mercies that we are not consumed, because his compassions fail not.",
      WEB: "It is because of Yahweh's loving kindnesses that we are not consumed, because his compassion doesn't fail.",
    },
  },
  {
    ref: "Lamentations 3:23",
    versions: {
      KJV: "They are new every morning: great is thy faithfulness.",
      WEB: "They are new every morning. Great is your faithfulness.",
    },
  },
  {
    ref: "Lamentations 3:25",
    versions: {
      KJV: "The LORD is good unto them that wait for him, to the soul that seeketh him.",
      WEB: "Yahweh is good to those who wait for him, to the soul who seeks him.",
    },
  },
  {
    ref: "Ezekiel 36:26",
    versions: {
      KJV: "A new heart also will I give you, and a new spirit will I put within you.",
      WEB: "I will also give you a new heart, and I will put a new spirit within you.",
    },
  },
  {
    ref: "Ezekiel 37:3",
    versions: {
      KJV: "Can these bones live?",
      WEB: "Can these bones live?",
    },
  },
  {
    ref: "Daniel 3:17",
    versions: {
      KJV: "Our God whom we serve is able to deliver us.",
      WEB: "Our God whom we serve is able to deliver us.",
    },
  },
  {
    ref: "Daniel 12:3",
    versions: {
      KJV: "And they that be wise shall shine as the brightness of the firmament.",
      WEB: "Those who are wise will shine as the brightness of the expanse.",
    },
  },
  {
    ref: "Daniel 2:21",
    versions: {
      KJV: "He giveth wisdom unto the wise, and knowledge to them that know understanding.",
      WEB: "He gives wisdom to the wise, and knowledge to those who have understanding.",
    },
  },
  {
    ref: "Hosea 14:4",
    versions: {
      KJV: "I will heal their backsliding, I will love them freely: for mine anger is turned away.",
      WEB: "I will heal their waywardness. I will love them freely; for my anger is turned away from him.",
    },
  },
  {
    ref: "Hosea 6:1",
    versions: {
      KJV: "Come, and let us return unto the LORD: for he hath torn, and he will heal us.",
      WEB: "Come, and let us return to Yahweh; for he has torn us to pieces, and he will heal us.",
    },
  },
  {
    ref: "Joel 2:25",
    versions: {
      KJV: "And I will restore to you the years that the locust hath eaten.",
      WEB: "I will restore to you the years that the swarming locust has eaten.",
    },
  },
  {
    ref: "Joel 3:16",
    versions: {
      KJV: "The LORD also will be the hope of his people, and the strength of the children of Israel.",
      WEB: "Yahweh will be a refuge for his people, and a stronghold for the children of Israel.",
    },
  },
  {
    ref: "Amos 5:14",
    versions: {
      KJV: "Seek good, and not evil, that ye may live: and so the LORD... shall be with you.",
      WEB: "Seek good, and not evil, that you may live; and so Yahweh... will be with you.",
    },
  },
  {
    ref: "Jonah 2:9",
    versions: {
      KJV: "The salvation is of the LORD.",
      WEB: "Salvation belongs to Yahweh.",
    },
  },
  {
    ref: "Micah 6:8",
    versions: {
      KJV: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God.",
      WEB: "He has shown you, O man, what is good. What does Yahweh require of you, but to act justly, to love mercy, and to walk humbly with your God?",
    },
  },
  {
    ref: "Micah 7:18",
    versions: {
      KJV: "Who is a God like unto thee, that pardoneth iniquity... he retaineth not his anger for ever, because he delighteth in mercy.",
      WEB: "Who is a God like you, who pardons iniquity... he doesn't retain his anger forever, because he delights in loving kindness.",
    },
  },
  {
    ref: "Nahum 1:7",
    versions: {
      KJV: "The LORD is good, a strong hold in the day of trouble; and he knoweth them that trust in him.",
      WEB: "Yahweh is good, a stronghold in the day of trouble; and he knows those who take refuge in him.",
    },
  },
  {
    ref: "Habakkuk 3:17-18",
    versions: {
      KJV: "Although the fig tree shall not blossom... yet I will rejoice in the LORD, I will joy in the God of my salvation.",
      WEB: "Although the fig tree doesn't flourish... yet I will rejoice in Yahweh. I will be joyful in the God of my salvation!",
    },
  },
  {
    ref: "Habakkuk 2:4",
    versions: {
      KJV: "The just shall live by his faith.",
      WEB: "The righteous shall live by his faith.",
    },
  },
  {
    ref: "Zephaniah 3:17",
    versions: {
      KJV: "The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy.",
      WEB: "Yahweh, your God, is in the midst of you, a mighty one who will save. He will rejoice over you with joy.",
    },
  },
  {
    ref: "Haggai 2:9",
    versions: {
      KJV: "The glory of this latter house shall be greater than of the former... and in this place will I give peace.",
      WEB: "The latter glory of this house will be greater than the former... and in this place I will give peace.",
    },
  },
  {
    ref: "Zechariah 4:6",
    versions: {
      KJV: "Not by might, nor by power, but by my spirit, saith the LORD of hosts.",
      WEB: "Not by might, nor by power, but by my Spirit, says Yahweh of Armies.",
    },
  },
  {
    ref: "Zechariah 9:12",
    versions: {
      KJV: "Turn ye to the strong hold, ye prisoners of hope.",
      WEB: "Turn to the stronghold, you prisoners of hope!",
    },
  },
  {
    ref: "Malachi 4:2",
    versions: {
      KJV: "But unto you that fear my name shall the Sun of righteousness arise with healing in his wings.",
      WEB: "But to you who fear my name shall the sun of righteousness arise with healing in its wings.",
    },
  },
  {
    ref: "Matthew 5:4",
    versions: {
      KJV: "Blessed are they that mourn: for they shall be comforted.",
      WEB: "Blessed are those who mourn, for they shall be comforted.",
    },
  },
  {
    ref: "Matthew 5:3",
    versions: {
      KJV: "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
      WEB: "Blessed are the poor in spirit, for theirs is the Kingdom of Heaven.",
    },
  },
  {
    ref: "Matthew 5:14",
    versions: {
      KJV: "Ye are the light of the world.",
      WEB: "You are the light of the world.",
    },
  },
  {
    ref: "Matthew 5:16",
    versions: {
      KJV: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.",
      WEB: "Even so, let your light shine before men, that they may see your good works and glorify your Father who is in heaven.",
    },
  },
  {
    ref: "Matthew 6:34",
    versions: {
      KJV: "Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself.",
      WEB: "Therefore don't be anxious for tomorrow, for tomorrow will be anxious for itself.",
    },
  },
  {
    ref: "Matthew 6:26",
    versions: {
      KJV: "Behold the fowls of the air: for they sow not, neither do they reap... yet your heavenly Father feedeth them.",
      WEB: "See the birds of the sky, that they don't sow, neither reap... yet your heavenly Father feeds them.",
    },
  },
  {
    ref: "Matthew 7:7",
    versions: {
      KJV: "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.",
      WEB: "Ask, and it will be given you. Seek, and you will find. Knock, and it will be opened for you.",
    },
  },
  {
    ref: "Matthew 11:28",
    versions: {
      KJV: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      WEB: "Come to me, all you who labor and are heavily burdened, and I will give you rest.",
    },
  },
  {
    ref: "Matthew 11:29",
    versions: {
      KJV: "Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.",
      WEB: "Take my yoke upon you and learn from me, for I am gentle and lowly in heart; and you will find rest for your souls.",
    },
  },
  {
    ref: "Matthew 11:30",
    versions: {
      KJV: "For my yoke is easy, and my burden is light.",
      WEB: "For my yoke is easy, and my burden is light.",
    },
  },
  {
    ref: "Matthew 12:20",
    versions: {
      KJV: "A bruised reed shall he not break, and smoking flax shall he not quench, till he send forth judgment unto victory.",
      WEB: "He won't break a bruised reed. He won't quench a smoking flax, until he leads justice to victory.",
    },
  },
  {
    ref: "Matthew 14:27",
    versions: {
      KJV: "Be of good cheer; it is I; be not afraid.",
      WEB: "Cheer up! It is I! Don't be afraid.",
    },
  },
  {
    ref: "Matthew 19:26",
    versions: {
      KJV: "With men this is impossible; but with God all things are possible.",
      WEB: "With men this is impossible, but with God all things are possible.",
    },
  },
  {
    ref: "Matthew 28:20",
    versions: {
      KJV: "Lo, I am with you alway, even unto the end of the world.",
      WEB: "Behold, I am with you always, even to the end of the age.",
    },
  },
  {
    ref: "Matthew 5:7",
    versions: {
      KJV: "Blessed are the merciful: for they shall obtain mercy.",
      WEB: "Blessed are the merciful, for they shall obtain mercy.",
    },
  },
  {
    ref: "Mark 5:36",
    versions: {
      KJV: "Be not afraid, only believe.",
      WEB: "Don't be afraid, only believe.",
    },
  },
  {
    ref: "Mark 10:27",
    versions: {
      KJV: "With God all things are possible.",
      WEB: "For everything is possible for God.",
    },
  },
  {
    ref: "Mark 11:24",
    versions: {
      KJV: "What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.",
      WEB: "Whatever things you pray and ask for, believe that you have received them, and you shall have them.",
    },
  },
  {
    ref: "Mark 4:39",
    versions: {
      KJV: "Peace, be still. And the wind ceased, and there was a great calm.",
      WEB: "Peace! Be still! The wind ceased, and there was a great calm.",
    },
  },
  {
    ref: "Mark 9:24",
    versions: {
      KJV: "Lord, I believe; help thou mine unbelief.",
      WEB: "Lord, I believe. Help my unbelief.",
    },
  },
  {
    ref: "Luke 2:10",
    versions: {
      KJV: "Fear not: for, behold, I bring you good tidings of great joy.",
      WEB: "Don't be afraid, for behold, I bring you good news of great joy,",
    },
  },
  {
    ref: "Luke 2:14",
    versions: {
      KJV: "And on earth peace, good will toward men.",
      WEB: "and on earth peace, good will toward men.",
    },
  },
  {
    ref: "Luke 6:38",
    versions: {
      KJV: "Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over.",
      WEB: "Give, and it will be given to you: good measure, pressed down, shaken together, and running over, will be given to you.",
    },
  },
  {
    ref: "Luke 12:32",
    versions: {
      KJV: "Fear not, little flock; for it is your Father's good pleasure to give you the kingdom.",
      WEB: "Don't be afraid, little flock, for it is your Father's good pleasure to give you the Kingdom.",
    },
  },
  {
    ref: "Luke 1:37",
    versions: {
      KJV: "For with God nothing shall be impossible.",
      WEB: "For everything spoken by God is possible.",
    },
  },
  {
    ref: "Luke 1:47",
    versions: {
      KJV: "And my spirit hath rejoiced in God my Saviour.",
      WEB: "My spirit has rejoiced in God my Savior,",
    },
  },
  {
    ref: "Luke 6:23",
    versions: {
      KJV: "Rejoice, and be exceeding glad: for great is your reward in heaven.",
      WEB: "Rejoice in that day, and leap for joy, for behold, your reward is great in heaven,",
    },
  },
  {
    ref: "Luke 18:4, Matthew 18:4",
    versions: {
      KJV: "Whosoever shall humble himself as this little child, the same is greatest in the kingdom of heaven.",
      WEB: "Whoever therefore humbles himself as this little child, the same is the greatest in the Kingdom of Heaven.",
    },
  },
  {
    ref: "Luke 15:10",
    versions: {
      KJV: "There is joy in the presence of the angels of God over one sinner that repenteth.",
      WEB: "There is joy in the presence of the angels of God over one sinner who repents.",
    },
  },
  {
    ref: "Luke 15:24",
    versions: {
      KJV: "This my son was dead, and is alive again; he was lost, and is found.",
      WEB: "For this, my son, was dead, and is alive again. He was lost, and is found.",
    },
  },
  {
    ref: "John 3:16",
    versions: {
      KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      WEB: "For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.",
    },
  },
  {
    ref: "John 14:27",
    versions: {
      KJV: "Peace I leave with you, my peace I give unto you... let not your heart be troubled, neither let it be afraid.",
      WEB: "Peace I leave with you. My peace I give to you... don't let your heart be troubled, neither let it be fearful.",
    },
  },
  {
    ref: "John 16:33",
    versions: {
      KJV: "These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.",
      WEB: "I have told you these things, that in me you may have peace. In the world you have oppression, but cheer up! I have overcome the world.",
    },
  },
  {
    ref: "John 14:6",
    versions: {
      KJV: "I am the way, the truth, and the life.",
      WEB: "I am the way, the truth, and the life.",
    },
  },
  {
    ref: "John 14:2",
    versions: {
      KJV: "In my Father's house are many mansions... I go to prepare a place for you.",
      WEB: "In my Father's house are many rooms... I am going to prepare a place for you.",
    },
  },
  {
    ref: "John 10:10",
    versions: {
      KJV: "I am come that they might have life, and that they might have it more abundantly.",
      WEB: "I came that they may have life, and may have it abundantly.",
    },
  },
  {
    ref: "John 10:11",
    versions: {
      KJV: "I am the good shepherd: the good shepherd giveth his life for the sheep.",
      WEB: "I am the good shepherd. The good shepherd lays down his life for the sheep.",
    },
  },
  {
    ref: "John 11:25",
    versions: {
      KJV: "I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live.",
      WEB: "I am the resurrection and the life. He who believes in me will still live, even if he dies.",
    },
  },
  {
    ref: "John 11:35",
    versions: {
      KJV: "Jesus wept.",
      WEB: "Jesus wept.",
    },
  },
  {
    ref: "John 14:15-16",
    versions: {
      KJV: "If ye love me, keep my commandments. And I will pray the Father, and he shall give you another Comforter.",
      WEB: "If you love me, keep my commandments. I will ask the Father, and he will give you another Counselor,",
    },
  },
  {
    ref: "John 14:26",
    versions: {
      KJV: "But the Comforter, which is the Holy Ghost... he shall teach you all things.",
      WEB: "But the Counselor, the Holy Spirit... will teach you all things.",
    },
  },
  {
    ref: "John 15:11",
    versions: {
      KJV: "These things have I spoken unto you, that my joy might remain in you, and that your joy might be full.",
      WEB: "I have spoken these things to you, that my joy may remain in you, and that your joy may be made full.",
    },
  },
  {
    ref: "John 15:13",
    versions: {
      KJV: "Greater love hath no man than this, that a man lay down his life for his friends.",
      WEB: "Greater love has no one than this, that someone lay down his life for his friends.",
    },
  },
  {
    ref: "John 16:22",
    versions: {
      KJV: "Ye now therefore have sorrow: but I will see you again, and your heart shall rejoice, and your joy no man taketh from you.",
      WEB: "You therefore now have sorrow, but I will see you again, and your heart will rejoice, and no one will take your joy away from you.",
    },
  },
  {
    ref: "John 16:24",
    versions: {
      KJV: "Ask, and ye shall receive, that your joy may be full.",
      WEB: "Ask, and you will receive, that your joy may be made full.",
    },
  },
  {
    ref: "John 8:12",
    versions: {
      KJV: "I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.",
      WEB: "I am the light of the world. He who follows me will not walk in the darkness, but will have the light of life.",
    },
  },
  {
    ref: "John 8:36",
    versions: {
      KJV: "Then said Jesus... If the Son therefore shall make you free, ye shall be free indeed.",
      WEB: "Jesus said... If therefore the Son makes you free, you will be free indeed.",
    },
  },
  {
    ref: "John 8:32",
    versions: {
      KJV: "And ye shall know the truth, and the truth shall make you free.",
      WEB: "You will know the truth, and the truth will make you free.",
    },
  },
  {
    ref: "2 Chronicles 20:20",
    versions: {
      KJV: "Believe in the LORD, and ye shall be established; believe his prophets, so shall ye prosper.",
      WEB: "Believe in Yahweh your God, so you shall be established! Believe his prophets, so you shall prosper.",
    },
  },
  {
    ref: "1 Peter 1:8",
    versions: {
      KJV: "Whom having not seen, ye love; in whom, though now ye see him not, yet believing, ye rejoice with joy unspeakable and full of glory.",
      WEB: "Having not seen him, you love him. Though you don't see him now, you believe in him and rejoice greatly with joy unspeakable and full of glory,",
    },
  },
  {
    ref: "Acts 1:8",
    versions: {
      KJV: "Ye shall receive power, after that the Holy Ghost is come upon you.",
      WEB: "You will receive power when the Holy Spirit has come on you.",
    },
  },
  {
    ref: "Acts 17:28",
    versions: {
      KJV: "In him we live, and move, and have our being.",
      WEB: "In him we live, move, and have our being,",
    },
  },
  {
    ref: "Acts 20:35",
    versions: {
      KJV: "It is more blessed to give than to receive.",
      WEB: "It is more blessed to give than to receive.",
    },
  },
  {
    ref: "Acts 2:4",
    versions: {
      KJV: "And they were all filled with the Holy Ghost.",
      WEB: "They were all filled with the Holy Spirit,",
    },
  },
  {
    ref: "Acts 11:24",
    versions: {
      KJV: "Barnabas... a good man, and full of the Holy Ghost and of faith.",
      WEB: "Barnabas... a good man, full of the Holy Spirit and of faith,",
    },
  },
  {
    ref: "Acts 4:36",
    versions: {
      KJV: "Joseph, who by the apostles was surnamed Barnabas... The son of consolation.",
      WEB: "Joseph, who by the apostles was surnamed Barnabas... Son of Encouragement,",
    },
  },
  {
    ref: "Romans 15:13",
    versions: {
      KJV: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
      WEB: "Now the God of hope fill you with all joy and peace in believing, that you may abound in hope in the power of the Holy Spirit.",
    },
  },
  {
    ref: "Romans 8:28",
    versions: {
      KJV: "And we know that all things work together for good to them that love God.",
      WEB: "We know that all things work together for good for those who love God,",
    },
  },
  {
    ref: "Romans 8:31",
    versions: {
      KJV: "If God be for us, who can be against us?",
      WEB: "If God is for us, who can be against us?",
    },
  },
  {
    ref: "Romans 8:35",
    versions: {
      KJV: "Who shall separate us from the love of Christ?",
      WEB: "Who shall separate us from the love of Christ?",
    },
  },
  {
    ref: "Romans 8:39",
    versions: {
      KJV: "Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God.",
      WEB: "nor height, nor depth, nor any other created thing, will be able to separate us from the love of God,",
    },
  },
  {
    ref: "Romans 5:1",
    versions: {
      KJV: "Being justified by faith, we have peace with God through our Lord Jesus Christ.",
      WEB: "Being therefore justified by faith, we have peace with God through our Lord Jesus Christ;",
    },
  },
  {
    ref: "Romans 5:8",
    versions: {
      KJV: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.",
      WEB: "But God commends his own love toward us, in that while we were yet sinners, Christ died for us.",
    },
  },
  {
    ref: "Romans 5:4-5",
    versions: {
      KJV: "And patience, experience; and experience, hope: and hope maketh not ashamed.",
      WEB: "and perseverance, proven character; and proven character, hope:",
    },
  },
  {
    ref: "Romans 5:3",
    versions: {
      KJV: "We glory in tribulations also: knowing that tribulation worketh patience.",
      WEB: "We also rejoice in our sufferings, knowing that suffering produces perseverance;",
    },
  },
  {
    ref: "Romans 8:38-39",
    versions: {
      KJV: "For I am persuaded, that neither death, nor life... shall be able to separate us from the love of God.",
      WEB: "For I am persuaded, that neither death, nor life... will be able to separate us from the love of God,",
    },
  },
  {
    ref: "Romans 12:12",
    versions: {
      KJV: "Rejoicing in hope; patient in tribulation; continuing instant in prayer.",
      WEB: "rejoicing in hope, enduring in troubles, continuing steadfastly in prayer,",
    },
  },
  {
    ref: "Romans 12:21",
    versions: {
      KJV: "Be not overcome of evil, but overcome evil with good.",
      WEB: "Don't be overcome by evil, but overcome evil with good.",
    },
  },
  {
    ref: "Romans 12:15",
    versions: {
      KJV: "Rejoice with them that do rejoice, and weep with them that weep.",
      WEB: "Rejoice with those who rejoice. Weep with those who weep.",
    },
  },
  {
    ref: "Romans 12:9",
    versions: {
      KJV: "Let love be without dissimulation. Abhor that which is evil; cleave to that which is good.",
      WEB: "Let love be without hypocrisy. Abhor that which is evil. Cling to that which is good.",
    },
  },
  {
    ref: "Romans 15:5",
    versions: {
      KJV: "Now the God of patience and consolation grant you to be likeminded one toward another.",
      WEB: "Now the God of perseverance and of encouragement grant you to be of the same mind with one another,",
    },
  },
  {
    ref: "Romans 15:4",
    versions: {
      KJV: "For whatsoever things were written aforetime were written for our learning, that we through patience and comfort of the scriptures might have hope.",
      WEB: "For as many things as were written before were written for our learning, that through perseverance and through encouragement of the Scriptures we might have hope.",
    },
  },
  {
    ref: "Romans 15:1",
    versions: {
      KJV: "We then that are strong ought to bear the infirmities of the weak, and not to please ourselves.",
      WEB: "Now we who are strong ought to bear the weaknesses of the weak, and not to please ourselves.",
    },
  },
  {
    ref: "Romans 14:17",
    versions: {
      KJV: "For the kingdom of God is not meat and drink; but righteousness, and peace, and joy in the Holy Ghost.",
      WEB: "For the Kingdom of God is not eating and drinking, but righteousness, peace, and joy in the Holy Spirit.",
    },
  },
  {
    ref: "Romans 14:12",
    versions: {
      KJV: "So then every one of us shall give account of himself to God.",
      WEB: "So then each one of us will give account of himself to God.",
    },
  },
  {
    ref: "Romans 10:15",
    versions: {
      KJV: "How beautiful are the feet of them that preach the gospel of peace.",
      WEB: "How beautiful are the feet of those who preach the Good News of peace,",
    },
  },
  {
    ref: "1 Corinthians 13:4",
    versions: {
      KJV: "Charity suffereth long, and is kind; charity envieth not.",
      WEB: "Love is patient and is kind. Love doesn't envy.",
    },
  },
  {
    ref: "1 Corinthians 13:7",
    versions: {
      KJV: "Beareth all things, believeth all things, hopeth all things, endureth all things.",
      WEB: "bears all things, believes all things, hopes all things, endures all things.",
    },
  },
  {
    ref: "1 Corinthians 13:13",
    versions: {
      KJV: "And now abideth faith, hope, charity, these three; but the greatest of these is charity.",
      WEB: "But now faith, hope, and love remain, these three. The greatest of these is love.",
    },
  },
  {
    ref: "1 Corinthians 10:13",
    versions: {
      KJV: "God is faithful, who will not suffer you to be tempted above that ye are able.",
      WEB: "God is faithful, who will not allow you to be tempted above what you are able,",
    },
  },
  {
    ref: "1 Corinthians 2:9",
    versions: {
      KJV: "Eye hath not seen, nor ear heard... the things which God hath prepared for them that love him.",
      WEB: "Things which an eye didn't see, and an ear didn't hear... which God prepared for those who love him.",
    },
  },
  {
    ref: "1 Corinthians 15:58",
    versions: {
      KJV: "Therefore, my beloved brethren, be ye stedfast, unmoveable, always abounding in the work of the Lord.",
      WEB: "Therefore, my beloved brothers, be steadfast, immovable, always abounding in the Lord's work,",
    },
  },
  {
    ref: "1 Corinthians 15:55",
    versions: {
      KJV: "O death, where is thy sting? O grave, where is thy victory?",
      WEB: "Death, where is your sting? Hades, where is your victory?",
    },
  },
  {
    ref: "1 Corinthians 16:13",
    versions: {
      KJV: "Watch ye, stand fast in the faith, quit you like men, be strong.",
      WEB: "Watch! Stand firm in the faith! Be courageous! Be strong!",
    },
  },
  {
    ref: "1 Corinthians 3:16",
    versions: {
      KJV: "Know ye not that ye are the temple of God, and that the Spirit of God dwelleth in you?",
      WEB: "Don't you know that you are a temple of God, and that God's Spirit lives in you?",
    },
  },
  {
    ref: "1 Corinthians 16:14",
    versions: {
      KJV: "Let all your things be done with charity.",
      WEB: "Let all that you do be done in love.",
    },
  },
  {
    ref: "2 Corinthians 5:7",
    versions: {
      KJV: "For we walk by faith, not by sight.",
      WEB: "For we walk by faith, not by sight;",
    },
  },
  {
    ref: "2 Corinthians 2:14",
    versions: {
      KJV: "Now thanks be unto God, which always causeth us to triumph in Christ.",
      WEB: "Now thanks be to God, who always leads us in triumph in Christ,",
    },
  },
  {
    ref: "2 Corinthians 1:3-4",
    versions: {
      KJV: "Blessed be God... the Father of mercies, and the God of all comfort; who comforteth us in all our tribulation.",
      WEB: "Blessed be the God... the Father of mercies and God of all comfort; who comforts us in all our affliction,",
    },
  },
  {
    ref: "2 Corinthians 4:17",
    versions: {
      KJV: "For our light affliction, which is but for a moment, worketh for us a far more exceeding and eternal weight of glory.",
      WEB: "For our light affliction, which is for the moment, works for us more and more exceedingly an eternal weight of glory,",
    },
  },
  {
    ref: "2 Corinthians 4:8",
    versions: {
      KJV: "We are troubled on every side, yet not distressed; we are perplexed, but not in despair.",
      WEB: "We are pressed on every side, yet not crushed; perplexed, yet not to despair;",
    },
  },
  {
    ref: "2 Corinthians 5:17",
    versions: {
      KJV: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
      WEB: "Therefore if anyone is in Christ, he is a new creation. The old things have passed away. Behold, all things have become new.",
    },
  },
  {
    ref: "2 Corinthians 6:2",
    versions: {
      KJV: "For he saith, I have heard thee in a time accepted... behold, now is the day of salvation.",
      WEB: "For he says, I listened to you in an acceptable time... now is the acceptable time. Now is the day of salvation.",
    },
  },
  {
    ref: "2 Corinthians 9:7",
    versions: {
      KJV: "God loveth a cheerful giver.",
      WEB: "God loves a cheerful giver.",
    },
  },
  {
    ref: "2 Corinthians 12:9",
    versions: {
      KJV: "My grace is sufficient for thee: for my strength is made perfect in weakness.",
      WEB: "My grace is sufficient for you, for my power is made perfect in weakness.",
    },
  },
  {
    ref: "2 Corinthians 12:10",
    versions: {
      KJV: "When I am weak, then am I strong.",
      WEB: "When I am weak, then am I strong.",
    },
  },
  {
    ref: "2 Timothy 4:18",
    versions: {
      KJV: "The Lord... shall deliver me from every evil work, and will preserve me unto his heavenly kingdom.",
      WEB: "The Lord... will deliver me from every evil work and will preserve me for his heavenly Kingdom;",
    },
  },
  {
    ref: "2 Corinthians 3:17",
    versions: {
      KJV: "Now the Lord is that Spirit: and where the Spirit of the Lord is, there is liberty.",
      WEB: "Now the Lord is the Spirit; and where the Spirit of the Lord is, there is liberty.",
    },
  },
  {
    ref: "Galatians 5:22",
    versions: {
      KJV: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith.",
      WEB: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, and faithfulness,",
    },
  },
  {
    ref: "Galatians 6:9",
    versions: {
      KJV: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
      WEB: "Let's not be weary in doing good, for we will reap in due season, if we don't give up.",
    },
  },
  {
    ref: "Galatians 6:2",
    versions: {
      KJV: "Bear ye one another's burdens, and so fulfil the law of Christ.",
      WEB: "Bear one another's burdens, and so fulfill the law of Christ.",
    },
  },
  {
    ref: "Galatians 2:20",
    versions: {
      KJV: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me.",
      WEB: "I have been crucified with Christ, and it is no longer I who live, but Christ living in me.",
    },
  },
  {
    ref: "Galatians 3:26",
    versions: {
      KJV: "For ye are all the children of God by faith in Christ Jesus.",
      WEB: "For you are all children of God, through faith in Christ Jesus.",
    },
  },
  {
    ref: "Galatians 5:1",
    versions: {
      KJV: "Stand fast therefore in the liberty wherewith Christ hath made us free.",
      WEB: "Stand firm therefore in the liberty by which Christ has made us free,",
    },
  },
  {
    ref: "Ephesians 2:8",
    versions: {
      KJV: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
      WEB: "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God,",
    },
  },
  {
    ref: "Ephesians 2:10",
    versions: {
      KJV: "For we are his workmanship, created in Christ Jesus unto good works.",
      WEB: "For we are his workmanship, created in Christ Jesus for good works,",
    },
  },
  {
    ref: "Ephesians 3:17-18",
    versions: {
      KJV: "That ye, being rooted and grounded in love, may be able to comprehend... the love of Christ.",
      WEB: "That you, being rooted and grounded in love, may be strengthened to comprehend... the love of Christ,",
    },
  },
  {
    ref: "Ephesians 3:20",
    versions: {
      KJV: "Now unto him that is able to do exceeding abundantly above all that we ask or think.",
      WEB: "Now to him who is able to do exceedingly abundantly above all that we ask or think,",
    },
  },
  {
    ref: "Ephesians 4:32",
    versions: {
      KJV: "Be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.",
      WEB: "And be kind to one another, tender hearted, forgiving each other, just as God also in Christ forgave you.",
    },
  },
  {
    ref: "Ephesians 4:29",
    versions: {
      KJV: "Let no corrupt communication proceed out of your mouth, but that which is good to the use of edifying.",
      WEB: "Let no corrupt speech proceed out of your mouth, but only what is good for building others up,",
    },
  },
  {
    ref: "Ephesians 6:10",
    versions: {
      KJV: "Finally, my brethren, be strong in the Lord, and in the power of his might.",
      WEB: "Finally, be strong in the Lord, and in the strength of his might.",
    },
  },
  {
    ref: "Philippians 4:13",
    versions: {
      KJV: "I can do all things through Christ which strengtheneth me.",
      WEB: "I can do all things through Christ, who strengthens me.",
    },
  },
  {
    ref: "Philippians 4:6",
    versions: {
      KJV: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
      WEB: "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.",
    },
  },
  {
    ref: "Philippians 4:7",
    versions: {
      KJV: "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
      WEB: "And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.",
    },
  },
  {
    ref: "Philippians 4:4",
    versions: {
      KJV: "Rejoice in the Lord alway: and again I say, Rejoice.",
      WEB: "Rejoice in the Lord always! Again I will say, rejoice!",
    },
  },
  {
    ref: "Philippians 4:11",
    versions: {
      KJV: "I have learned, in whatsoever state I am, therewith to be content.",
      WEB: "I have learned, in whatever state I am, to be content in it.",
    },
  },
  {
    ref: "Philippians 4:19",
    versions: {
      KJV: "But my God shall supply all your need according to his riches in glory by Christ Jesus.",
      WEB: "My God will supply every need of yours according to his riches in glory in Christ Jesus.",
    },
  },
  {
    ref: "Philippians 1:6",
    versions: {
      KJV: "Being confident of this very thing, that he which hath begun a good work in you will perform it.",
      WEB: "Being confident of this very thing, that he who began a good work in you will complete it,",
    },
  },
  {
    ref: "Colossians 3:15",
    versions: {
      KJV: "And let the peace of God rule in your hearts, to the which also ye are called in one body; and be ye thankful.",
      WEB: "And let the peace of God rule in your hearts, to which also you were called in one body, and be thankful.",
    },
  },
  {
    ref: "Colossians 3:12",
    versions: {
      KJV: "Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of mind, meekness, longsuffering.",
      WEB: "Put on therefore, as God's chosen ones, holy and beloved, a heart of compassion, kindness, lowliness, humility, and perseverance,",
    },
  },
  {
    ref: "Colossians 3:14",
    versions: {
      KJV: "And above all these things put on charity, which is the bond of perfectness.",
      WEB: "Above all these things, walk in love, which is the bond of perfection.",
    },
  },
  {
    ref: "Colossians 3:2",
    versions: {
      KJV: "Set your affection on things above, not on things on the earth.",
      WEB: "Set your mind on the things that are above, not on the things that are on the earth.",
    },
  },
  {
    ref: "Colossians 1:27",
    versions: {
      KJV: "Christ in you, the hope of glory.",
      WEB: "Christ in you, the hope of glory,",
    },
  },
  {
    ref: "1 Thessalonians 4:18",
    versions: {
      KJV: "Comfort one another with these words.",
      WEB: "Comfort one another with these words.",
    },
  },
  {
    ref: "1 Thessalonians 5:11",
    versions: {
      KJV: "Wherefore comfort yourselves together, and edify one another.",
      WEB: "Therefore exhort one another, and build each other up,",
    },
  },
  {
    ref: "1 Thessalonians 5:16-18",
    versions: {
      KJV: "Rejoice evermore. Pray without ceasing. In every thing give thanks.",
      WEB: "Rejoice always. Pray without ceasing. In everything give thanks,",
    },
  },
  {
    ref: "1 Thessalonians 5:23",
    versions: {
      KJV: "And the very God of peace sanctify you wholly.",
      WEB: "May the God of peace himself sanctify you completely.",
    },
  },
  {
    ref: "1 Thessalonians 5:24",
    versions: {
      KJV: "Faithful is he that calleth you, who also will do it.",
      WEB: "He who calls you is faithful, who will also do it.",
    },
  },
  {
    ref: "2 Thessalonians 2:16-17",
    versions: {
      KJV: "Now our Lord Jesus Christ himself, and God, even our Father... comfort your hearts, and stablish you in every good word and work.",
      WEB: "Now our Lord Jesus Christ himself, and God our Father... comfort your hearts and establish you in every good work and word.",
    },
  },
  {
    ref: "2 Timothy 1:7",
    versions: {
      KJV: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
      WEB: "For God didn't give us a spirit of fear, but of power, love, and self-control.",
    },
  },
  {
    ref: "2 Timothy 4:7",
    versions: {
      KJV: "I have fought a good fight, I have finished my course, I have kept the faith.",
      WEB: "I have fought the good fight. I have finished the course. I have kept the faith.",
    },
  },
  {
    ref: "2 Timothy 2:15",
    versions: {
      KJV: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed.",
      WEB: "Give diligence to present yourself approved by God, a workman who doesn't need to be ashamed,",
    },
  },
  {
    ref: "1 Timothy 4:12",
    versions: {
      KJV: "Let no man despise thy youth; but be thou an example of the believers.",
      WEB: "Let no man despise your youth, but be an example to those who believe,",
    },
  },
  {
    ref: "1 Timothy 6:6",
    versions: {
      KJV: "Godliness with contentment is great gain.",
      WEB: "But godliness with contentment is great gain.",
    },
  },
  {
    ref: "Titus 2:13",
    versions: {
      KJV: "Looking for that blessed hope, and the glorious appearing of the great God.",
      WEB: "looking for the blessed hope and appearing of the glory of our great God",
    },
  },
  {
    ref: "Titus 3:5",
    versions: {
      KJV: "According to his mercy he saved us, by the washing of regeneration, and renewing of the Holy Ghost.",
      WEB: "he saved us, through the washing of regeneration and renewing by the Holy Spirit,",
    },
  },
  {
    ref: "Philemon 1:15",
    versions: {
      KJV: "For perhaps he therefore departed for a season, that thou shouldest receive him for ever.",
      WEB: "For perhaps he was therefore separated from you for a while, that you would have him forever,",
    },
  },
  {
    ref: "Hebrews 11:1",
    versions: {
      KJV: "Now faith is the substance of things hoped for, the evidence of things not seen.",
      WEB: "Now faith is assurance of things hoped for, proof of things not seen.",
    },
  },
  {
    ref: "Hebrews 12:1",
    versions: {
      KJV: "Let us run with patience the race that is set before us.",
      WEB: "let's run with perseverance the race that is set before us,",
    },
  },
  {
    ref: "Hebrews 12:2",
    versions: {
      KJV: "Looking unto Jesus the author and finisher of our faith.",
      WEB: "looking to Jesus, the author and perfecter of faith,",
    },
  },
  {
    ref: "Hebrews 10:23",
    versions: {
      KJV: "Let us hold fast the profession of our faith without wavering; for he is faithful that promised.",
      WEB: "Let's hold fast the confession of our hope without wavering; for he who promised is faithful.",
    },
  },
  {
    ref: "Hebrews 10:24",
    versions: {
      KJV: "And let us consider one another to provoke unto love and to good works.",
      WEB: "let's consider how to provoke one another to love and good works,",
    },
  },
  {
    ref: "Hebrews 4:16",
    versions: {
      KJV: "Let us come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.",
      WEB: "Let's therefore draw near with boldness to the throne of grace, that we may receive mercy and may find grace for help in time of need.",
    },
  },
  {
    ref: "Hebrews 13:8",
    versions: {
      KJV: "Jesus Christ the same yesterday, and to day, and for ever.",
      WEB: "Jesus Christ is the same yesterday, today, and forever.",
    },
  },
  {
    ref: "Hebrews 13:1",
    versions: {
      KJV: "Let brotherly love continue.",
      WEB: "Let brotherly love continue.",
    },
  },
  {
    ref: "Hebrews 13:2",
    versions: {
      KJV: "Be not forgetful to entertain strangers: for thereby some have entertained angels unawares.",
      WEB: "Don't forget to show hospitality to strangers, for in doing so, some have entertained angels without knowing it.",
    },
  },
  {
    ref: "Hebrews 13:16",
    versions: {
      KJV: "But to do good and to communicate forget not: for with such sacrifices God is well pleased.",
      WEB: "But don't forget to be doing good and sharing, for with such sacrifices God is well pleased.",
    },
  },
  {
    ref: "James 1:2",
    versions: {
      KJV: "My brethren, count it all joy when ye fall into divers temptations.",
      WEB: "Count it all joy, my brothers, when you fall into various temptations,",
    },
  },
  {
    ref: "James 1:3",
    versions: {
      KJV: "Knowing this, that the trying of your faith worketh patience.",
      WEB: "knowing that the testing of your faith produces endurance.",
    },
  },
  {
    ref: "James 1:5",
    versions: {
      KJV: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally.",
      WEB: "But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach,",
    },
  },
  {
    ref: "James 1:17",
    versions: {
      KJV: "Every good gift and every perfect gift is from above, and cometh down from the Father of lights.",
      WEB: "Every good gift and every perfect gift is from above, coming down from the Father of lights,",
    },
  },
  {
    ref: "James 4:8",
    versions: {
      KJV: "Draw nigh to God, and he will draw nigh to you.",
      WEB: "Draw near to God, and he will draw near to you.",
    },
  },
  {
    ref: "James 5:16",
    versions: {
      KJV: "The effectual fervent prayer of a righteous man availeth much.",
      WEB: "The insistent prayer of a righteous person is powerfully effective.",
    },
  },
  {
    ref: "1 Peter 5:7",
    versions: {
      KJV: "Casting all your care upon him; for he careth for you.",
      WEB: "casting all your worries on him, because he cares for you.",
    },
  },
  {
    ref: "1 Peter 1:3",
    versions: {
      KJV: "Blessed be the God and Father of our Lord Jesus Christ, which... hath begotten us again unto a lively hope.",
      WEB: "Blessed be the God and Father of our Lord Jesus Christ, who... has become our father again to a living hope",
    },
  },
  {
    ref: "1 Peter 1:6",
    versions: {
      KJV: "Wherein ye greatly rejoice, though now for a season... ye are in heaviness through manifold temptations.",
      WEB: "in which you greatly rejoice, though now for a little while, if need be... you have been grieved by various trials,",
    },
  },
  {
    ref: "1 Peter 4:8",
    versions: {
      KJV: "And above all things have fervent charity among yourselves: for charity shall cover the multitude of sins.",
      WEB: "And above all things be earnest in your love among yourselves, for love covers a multitude of sins.",
    },
  },
  {
    ref: "1 Peter 4:10",
    versions: {
      KJV: "As every man hath received the gift, even so minister the same one to another.",
      WEB: "As each has received a gift, employ it in serving one another,",
    },
  },
  {
    ref: "1 Peter 5:6",
    versions: {
      KJV: "Humble yourselves therefore under the mighty hand of God, that he may exalt you in due time.",
      WEB: "Humble yourselves therefore under the mighty hand of God, that he may exalt you in due time,",
    },
  },
  {
    ref: "1 Peter 5:8",
    versions: {
      KJV: "Be sober, be vigilant; because your adversary the devil, as a roaring lion, walketh about.",
      WEB: "Be sober and self-controlled. Be watchful. Your adversary the devil walks around like a roaring lion,",
    },
  },
  {
    ref: "1 Peter 5:10",
    versions: {
      KJV: "But the God of all grace... after that ye have suffered a while, make you perfect, stablish, strengthen, settle you.",
      WEB: "But may the God of all grace... after you have suffered a little while, perfect, establish, strengthen, and settle you.",
    },
  },
  {
    ref: "2 Peter 1:3",
    versions: {
      KJV: "According as his divine power hath given unto us all things that pertain unto life and godliness.",
      WEB: "seeing that his divine power has granted to us all things that pertain to life and godliness,",
    },
  },
  {
    ref: "2 Peter 3:9",
    versions: {
      KJV: "The Lord is not slack concerning his promise... but is longsuffering to us-ward.",
      WEB: "The Lord is not slow concerning his promise... but is patient with us,",
    },
  },
  {
    ref: "1 John 4:16",
    versions: {
      KJV: "God is love; and he that dwelleth in love dwelleth in God, and God in him.",
      WEB: "God is love. Whoever remains in love remains in God, and God remains in him.",
    },
  },
  {
    ref: "1 John 4:18",
    versions: {
      KJV: "There is no fear in love; but perfect love casteth out fear.",
      WEB: "There is no fear in love; but perfect love casts out fear,",
    },
  },
  {
    ref: "1 John 4:19",
    versions: {
      KJV: "We love him, because he first loved us.",
      WEB: "We love him, because he first loved us.",
    },
  },
  {
    ref: "1 John 1:9",
    versions: {
      KJV: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
      WEB: "If we confess our sins, he is faithful and righteous to forgive us the sins and to cleanse us from all unrighteousness.",
    },
  },
  {
    ref: "1 John 4:7",
    versions: {
      KJV: "Beloved, let us love one another: for love is of God.",
      WEB: "Beloved, let us love one another, for love is of God,",
    },
  },
  {
    ref: "1 John 5:14",
    versions: {
      KJV: "And this is the confidence that we have in him, that, if we ask any thing according to his will, he heareth us.",
      WEB: "This is the boldness which we have toward him, that if we ask anything according to his will, he listens to us.",
    },
  },
  {
    ref: "3 John 1:2",
    versions: {
      KJV: "Beloved, I wish above all things that thou mayest prosper and be in health, even as thy soul prospereth.",
      WEB: "Beloved, I pray that you may prosper in all things and be healthy, even as your soul prospers.",
    },
  },
  {
    ref: "3 John 1:4",
    versions: {
      KJV: "I have no greater joy than to hear that my children walk in truth.",
      WEB: "I have no greater joy than this: to hear about my children walking in truth.",
    },
  },
  {
    ref: "Jude 1:24",
    versions: {
      KJV: "Now unto him that is able to keep you from falling, and to present you faultless... with exceeding joy.",
      WEB: "Now to him who is able to keep them from stumbling, and to present you faultless... with exceeding joy,",
    },
  },
  {
    ref: "2 John 1:3",
    versions: {
      KJV: "Grace be with you, mercy, and peace, from God the Father, and from the Lord Jesus Christ, the Son of the Father, in truth and love.",
      WEB: "Grace, mercy, and peace will be with us, from God the Father and from the Lord Jesus Christ, the Son of the Father, in truth and love.",
    },
  },
  {
    ref: "Revelation 21:4",
    versions: {
      KJV: "And God shall wipe away all tears from their eyes; and there shall be no more death.",
      WEB: "He will wipe away every tear from their eyes. Death will be no more,",
    },
  },
  {
    ref: "Revelation 21:5",
    versions: {
      KJV: "Behold, I make all things new.",
      WEB: "Behold, I am making all things new.",
    },
  },
  {
    ref: "Revelation 3:20",
    versions: {
      KJV: "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him.",
      WEB: "Behold, I stand at the door and knock. If anyone hears my voice and opens the door, then I will come in to him,",
    },
  },
  {
    ref: "Revelation 1:8",
    versions: {
      KJV: "I am Alpha and Omega, the beginning and the ending, saith the Lord.",
      WEB: "I am the Alpha and the Omega, the Beginning and the End, says the Lord God,",
    },
  },
  {
    ref: "Revelation 22:5",
    versions: {
      KJV: "And there shall be no night there; and they need no candle, neither light of the sun; for the Lord God giveth them light.",
      WEB: "There will be no night, and they need no lamp light or sunlight, for the Lord God will illuminate them.",
    },
  },
  {
    ref: "Psalm 1:1-2",
    versions: {
      KJV: "Blessed is the man that walketh not in the counsel of the ungodly... but his delight is in the law of the LORD.",
      WEB: "Blessed is the man who doesn't walk in the counsel of the wicked... but his delight is in Yahweh's law.",
    },
  },
  {
    ref: "Psalm 1:3",
    versions: {
      KJV: "He shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season.",
      WEB: "He will be like a tree planted by the streams of water, that produces its fruit in its season,",
    },
  },
  {
    ref: "Psalm 9:9",
    versions: {
      KJV: "The LORD also will be a refuge for the oppressed, a refuge in times of trouble.",
      WEB: "Yahweh will also be a high tower for the oppressed; a high tower in times of trouble.",
    },
  },
  {
    ref: "Psalm 11:4",
    versions: {
      KJV: "The LORD is in his holy temple, the LORD's throne is in heaven.",
      WEB: "Yahweh is in his holy temple. Yahweh is on his throne in heaven.",
    },
  },
  {
    ref: "Psalm 13:1,5",
    versions: {
      KJV: "How long wilt thou forget me, O LORD? for ever?... But I have trusted in thy mercy; my heart shall rejoice in thy salvation.",
      WEB: "How long, Yahweh? Will you forget me forever?... But I have trusted in your loving kindness. My heart rejoices in your salvation.",
    },
  },
  {
    ref: "Psalm 32:7",
    versions: {
      KJV: "Thou art my hiding place; thou shalt preserve me from trouble; thou shalt compass me about with songs of deliverance.",
      WEB: "You are my hiding place. You will preserve me from trouble. You will surround me with songs of deliverance.",
    },
  },
  {
    ref: "Psalm 34:4",
    versions: {
      KJV: "I sought the LORD, and he heard me, and delivered me from all my fears.",
      WEB: "I sought Yahweh, and he answered me, and delivered me from all my fears.",
    },
  },
  {
    ref: "Psalm 34:7",
    versions: {
      KJV: "The angel of the LORD encampeth round about them that fear him, and delivereth them.",
      WEB: "Yahweh's angel encamps around those who fear him, and delivers them.",
    },
  },
  {
    ref: "Psalm 34:19",
    versions: {
      KJV: "Many are the afflictions of the righteous: but the LORD delivereth him out of them all.",
      WEB: "Many are the afflictions of the righteous, but Yahweh delivers him out of them all.",
    },
  },
  {
    ref: "Psalm 37:39",
    versions: {
      KJV: "But the salvation of the righteous is of the LORD: he is their strength in the time of trouble.",
      WEB: "But the salvation of the righteous is from Yahweh. He is their stronghold in the time of trouble.",
    },
  },
  {
    ref: "Psalm 37:5",
    versions: {
      KJV: "Commit thy way unto the LORD; trust also in him; and he shall bring it to pass.",
      WEB: "Commit your way to Yahweh. Trust also in him, and he will do this:",
    },
  },
  {
    ref: "Psalm 37:37",
    versions: {
      KJV: "Mark the perfect man, and behold the upright: for the end of that man is peace.",
      WEB: "Mark the perfect man, and see the upright, for there is a future for the man of peace.",
    },
  },
  {
    ref: "Psalm 41:1",
    versions: {
      KJV: "Blessed is he that considereth the poor: the LORD will deliver him in time of trouble.",
      WEB: "Blessed is he who considers the poor. Yahweh will deliver him in the day of evil.",
    },
  },
  {
    ref: "Psalm 46:1-2",
    versions: {
      KJV: "God is our refuge and strength, a very present help in trouble. Therefore will not we fear.",
      WEB: "God is our refuge and strength, a very present help in trouble. Therefore we will not be afraid,",
    },
  },
  {
    ref: "Psalm 46:11",
    versions: {
      KJV: "The LORD of hosts is with us; the God of Jacob is our refuge.",
      WEB: "Yahweh of Armies is with us. The God of Jacob is our refuge.",
    },
  },
];
