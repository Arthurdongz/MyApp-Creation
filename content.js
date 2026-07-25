// Content banks for the Barnabas Journal app.
// Each array cycles independently by day, so the app needs no backend or network access.

const VERSES = [
  { text: "May the God of hope fill you with all joy and peace in believing, so that by the power of the Holy Spirit you may abound in hope.", ref: "Romans 15:13" },
  { text: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.", ref: "Jeremiah 29:11" },
  { text: "Weeping may tarry for the night, but joy comes with the morning.", ref: "Psalm 30:5" },
  { text: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles.", ref: "Isaiah 40:31" },
  { text: "The LORD your God is in your midst, a mighty one who will save; he will rejoice over you with gladness... he will exult over you with loud singing.", ref: "Zephaniah 3:17" },
  { text: "Suffering produces endurance, and endurance produces character, and character produces hope, and hope does not put us to shame.", ref: "Romans 5:3-5" },
  { text: "Therefore encourage one another and build one another up, just as you are doing.", ref: "1 Thessalonians 5:11" },
  { text: "Let us consider how to stir up one another to love and good works... encouraging one another.", ref: "Hebrews 10:24-25" },
  { text: "Anxiety in a man's heart weighs him down, but a good word makes him glad.", ref: "Proverbs 12:25" },
  { text: "Gracious words are like a honeycomb, sweetness to the soul and health to the body.", ref: "Proverbs 16:24" },
  { text: "Put on then, as God's chosen ones, holy and beloved, compassionate hearts, kindness, humility, meekness, and patience.", ref: "Colossians 3:12" },
  { text: "Let us not grow weary of doing good, for in due season we will reap, if we do not give up.", ref: "Galatians 6:9-10" },
  { text: "Let no corrupting talk come out of your mouths, but only such as is good for building up, that it may give grace to those who hear.", ref: "Ephesians 4:29" },
  { text: "As each has received a gift, use it to serve one another, as good stewards of God's varied grace.", ref: "1 Peter 4:10" },
  { text: "Let your light shine before others, so that they may see your good works and give glory to your Father.", ref: "Matthew 5:16" },
  { text: "In the world you will have tribulation. But take heart; I have overcome the world.", ref: "John 16:33" },
  { text: "The LORD is near to the brokenhearted and saves the crushed in spirit.", ref: "Psalm 34:18" },
  { text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you.", ref: "Isaiah 41:10" },
  { text: "Be strong and courageous... for the LORD your God is with you wherever you go.", ref: "Joshua 1:9" },
  { text: "He heals the brokenhearted and binds up their wounds.", ref: "Psalm 147:3" },
  { text: "The Father of mercies and God of all comfort, who comforts us in all our affliction, so that we may be able to comfort those in any affliction.", ref: "2 Corinthians 1:3-4" },
  { text: "Rejoice with those who rejoice, weep with those who weep.", ref: "Romans 12:15" },
  { text: "Love is patient and kind... it bears all things, believes all things, hopes all things, endures all things.", ref: "1 Corinthians 13:4,7" },
  { text: "Do not neglect to do good and to share what you have, for such sacrifices are pleasing to God.", ref: "Hebrews 13:16" },
  { text: "Bear one another's burdens, and so fulfill the law of Christ.", ref: "Galatians 6:2" },
  { text: "Oil and perfume make the heart glad, and the sweetness of a friend comes from his earnest counsel.", ref: "Proverbs 27:9" },
  { text: "Two are better than one... if they fall, one will lift up his fellow.", ref: "Ecclesiastes 4:9-10" },
  { text: "I lift up my eyes to the hills. From where does my help come? My help comes from the LORD.", ref: "Psalm 121:1-2" },
  { text: "The steadfast love of the LORD never ceases; his mercies are new every morning; great is your faithfulness.", ref: "Lamentations 3:22-23" },
  { text: "You make known to me the path of life; in your presence there is fullness of joy.", ref: "Psalm 16:11" },
  { text: "Joseph, who was also called by the apostles Barnabas (which means son of encouragement)...", ref: "Acts 4:36" },
];

const ENCOURAGEMENTS = [
  "You are not alone today — your presence matters more than you know.",
  "Whatever you're carrying, you don't have to carry it alone.",
  "Small steps still move you forward. Be gentle with yourself today.",
  "Your kindness yesterday is still echoing in someone's life.",
  "It's okay to rest. Healing has its own quiet pace.",
  "You have exactly what you need to get through today.",
  "Someone, somewhere, is grateful you exist.",
  "Today is a fresh page — write it gently.",
  "You don't have to have it all figured out to be doing well.",
  "Your story isn't finished. There is more good ahead.",
  "The fact that you're still trying is not small — it's brave.",
  "You are worthy of the same grace you give to others.",
  "One honest breath at a time. That's enough for now.",
  "You have survived every hard day so far. That's proof of your strength.",
  "Let today be lighter than yesterday.",
  "You are allowed to take up space and be cared for.",
  "The world is a little softer because you're in it.",
  "Progress, not perfection. You are doing better than you think.",
  "There is room in this day for both struggle and joy.",
  "You are seen, even on the days you feel invisible.",
  "Your gentleness is not weakness — it's quiet strength.",
  "You don't need to earn rest or love. You already have both.",
  "Today, let hope be a little louder than fear.",
  "You are capable of more grace than you give yourself credit for.",
  "It's alright to start again, as many times as you need.",
  "Your best today doesn't have to look like yesterday's best.",
  "You carry light, even when you can't see it yourself.",
  "Be patient with your own becoming.",
  "You matter beyond what you produce or achieve.",
  "Today, choose one kind thought about yourself and keep it.",
  "You are someone's reason to believe good people still exist.",
];

const BARNABAS_MOMENTS = [
  "Send a text telling someone specific why you're grateful for them.",
  "Give a genuine compliment to a stranger or coworker today.",
  "Write a short note of encouragement and leave it for someone to find.",
  "Call someone you haven't spoken to in a while, just to check in.",
  "Let someone go ahead of you today, with a smile.",
  "Tell a friend one specific thing you admire about them.",
  "Offer to help someone with a task they've been putting off.",
  "Leave an encouraging comment for someone who is struggling.",
  "Make or buy something small for someone as a surprise.",
  "Listen — really listen — to someone without rushing to respond.",
  "Forgive someone quietly today, even if they never know it.",
  "Thank someone who is often overlooked, like a cashier or a cleaner.",
  "Check in on someone you know is going through a hard season.",
  "Share a verse or quote that helped you with someone who needs hope.",
  "Give someone your full attention for five minutes, phone down.",
  "Pray for someone by name today, and let them know you did.",
  "Compliment someone's effort, not just their outcome.",
  "Write a letter of encouragement to your future self or someone else.",
  "Celebrate someone else's win today, out loud.",
  "Offer a ride, a meal, or a small practical kindness to someone in need.",
  "Tell someone specifically how they've helped shape who you are.",
  "Smile and greet someone who looks like they're having a hard day.",
  "Encourage someone who is doubting themselves right now.",
  "Share a hard season of your own, to remind someone they're not alone.",
  "Do a small task for someone without being asked or thanked.",
  "Send an encouraging voice note instead of a text today.",
  "Invite someone who might be lonely to join you for something.",
  "Tell a mentor or teacher the impact they had on you.",
  "Leave a generous, kind word about someone's hard work.",
  "Ask someone 'How are you, really?' and wait for the real answer.",
];

const WISDOM = [
  { type: "quote", text: "No act of kindness, no matter how small, is ever wasted.", source: "Aesop" },
  { type: "quote", text: "Encouragement is oxygen to the soul.", source: "Unknown" },
  { type: "quote", text: "Be kind, for everyone you meet is fighting a hard battle.", source: "Attr. Ian Maclaren" },
  { type: "quote", text: "Hope is being able to see that there is light despite all of the darkness.", source: "Desmond Tutu" },
  { type: "quote", text: "A word of encouragement during a failure is worth more than an hour of praise after success.", source: "Unknown" },
  { type: "quote", text: "Kind words can be short and easy to speak, but their echoes are truly endless.", source: "Mother Teresa" },
  { type: "quote", text: "We rise by lifting others.", source: "Robert Ingersoll" },
  { type: "quote", text: "It is not how much we give, but how much love we put into giving.", source: "Mother Teresa" },
  { type: "quote", text: "Even the smallest act of caring for another person is like a drop of water — it will make ripples through the entire pond.", source: "Unknown" },
  { type: "quote", text: "The best way to cheer yourself up is to try to cheer somebody else up.", source: "Mark Twain" },
  { type: "story", title: "The Cup of Coffee", text: "A young man, tight on money and tighter on hope, stood at the front of a long café line, counting coins. A stranger behind him quietly told the cashier, \"Add his to mine.\" No name was given, no thanks required. The young man walked out with a warm cup and something warmer still — the sense that he wasn't invisible after all." },
  { type: "story", title: "The Note in the Library Book", text: "Tucked inside a secondhand book, a reader found a note written years earlier: \"Whoever finds this — you are exactly where you need to be. Keep going.\" She never learned who wrote it, but she kept the note, and years later tucked a new one of her own into a different book, for a stranger she would never meet." },
  { type: "story", title: "The Old Man on the Bench", text: "Each afternoon, an old man sat alone on the same park bench. Most people walked past. One small child never did — she waved every single day. Years later, the man told anyone who'd listen that her small hello was the brightest part of some very dark years." },
  { type: "story", title: "Barnabas and Saul", text: "When Saul the persecutor turned follower of Jesus, the believers in Jerusalem were afraid of him — all except Barnabas, who took a chance on him, vouched for him before the apostles, and stood beside him. That one act of encouragement helped open the door for Saul to become Paul, and for the gospel to reach the world." },
  { type: "story", title: "The Teacher's Card", text: "A tired teacher, ready to quit, opened her mailbox to find a card from a student she'd taught a decade earlier: \"You believed in me when no one else did. I became a teacher too, because of you.\" She kept teaching for twenty more years." },
  { type: "story", title: "Two Widows", text: "Barnabas once sold a field he owned and gave the money away so others in need would have enough. It wasn't a public performance — it was quiet generosity that let someone else breathe easier that week." },
  { type: "story", title: "The Stranger's Umbrella", text: "Caught in a sudden downpour with no umbrella, a woman braced for a soaked walk home. A stranger jogged over, held their umbrella over her shoulder for three blocks, said \"stay dry,\" and walked on into the rain themselves." },
  { type: "story", title: "The Late-Night Text", text: "At 1 a.m., on the worst night in a long time, a phone buzzed: \"Just thinking of you — you've got this.\" It was nothing, and it was everything. Sometimes the smallest message arrives exactly when it's needed most." },
  { type: "story", title: "The New Kid", text: "On her first day at a new school, a girl sat alone at lunch, expecting nothing. A classmate she'd never spoken to sat down across from her and said, \"You can sit with us.\" It was the whole reason she made it through that year." },
];

function dayIndex() {
  const epoch = new Date(2024, 0, 1);
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.floor((startOfDay - epoch) / 86400000);
  return diffDays;
}

function pickForToday(arr) {
  const idx = ((dayIndex() % arr.length) + arr.length) % arr.length;
  return arr[idx];
}
