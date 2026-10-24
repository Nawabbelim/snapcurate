// What the AI looks for. Edit prompts to tune results. All SUBJECT+JUNK compete in one softmax (what is this photo MAINLY of?).
export const SUBJECT={
 sunset:'a sunset or sunrise sky over the horizon',goldensky:'golden hour sky with glowing orange clouds and the sun low',
 flowers:'a close-up of colourful blooming flowers',garden:'a lush garden full of flowers and plants',plants:'green leafy plants, trees and potted plants',
 landscape:'a scenic nature landscape with mountains, lake or forest',beach:'a beach with ocean waves',sky:'a blue sky with clouds',
 face:'a close-up portrait of one person face',selfie:'a selfie of one person smiling',
 pcar:'a person posing next to a car',pbike:'a person with a motorcycle or bike',pgarden:'a person standing in a flower garden',pcoffee:'a person holding a coffee cup at a cafe',ppet:'a person with a pet animal',pscene:'a person in front of a scenic view or landmark',
 family:'a group photo of several people or a family',child:'a photo of a small child',
 dog:'a dog',cat:'a cat',bird:'a bird',animal:'a wild animal or a horse',
 car:'a car',sportscar:'a sports car or luxury car',moto:'a motorcycle or scooter',bicycle:'a bicycle',
 coffee:'a cup of coffee or tea',food:'a plate of delicious food',dessert:'a dessert, cake or pastry',drink:'a colourful drink or smoothie',
 living:'a cozy aesthetic living room interior',bedroom:'a bedroom with nice decor',kitchen:'a clean kitchen interior',house:'a beautiful house exterior',
 city:'a city street or buildings',night:'city lights at night',
 mehndi:'henna mehndi design on hands',event:'a crowded party or event',objects:'random everyday objects on a table',
 bigcat:'a tiger, lion or big cat',mountains:'snow covered mountains or hills',forest:'a forest or a row of trees in the countryside',water:'a river, lake, waterfall or pond',field:'an open grassy field or countryside',moon:'a night sky with the moon and stars',art:'a fantasy digital illustration or artwork',toy:'a toy, figurine or movie character',
 clothes:'clothing, a saree or fabric on display',appliance:'a home appliance such as a washing machine or microwave',potware:'a pot, vase or kitchen utensil',furniture:'furniture such as a sofa, chair or bed',
 hair:'hair or the back of a head close-up',gadget:'a phone, laptop or gadget',market:'a street market, shop or crowd',jewel:'jewellery or accessories',shoes:'shoes, sneakers or feet close-up',
 leaf:'a close-up of green leaves',oneflower:'a single flower or flower bud',smallplant:'a small plant or sapling growing in soil or a pot',branch:'leafy branches or a tree close-up',
 tv:'a television on a tv unit in a room',fridge:'a refrigerator or kitchen appliances',ac:'an air conditioner on a wall',fan:'a ceiling fan or table fan',decor:'home decor, lamps and wall art',
 incar:'a photo taken inside a car showing the dashboard or seats',accident:'an accidental photo of the floor, ceiling, wall or pocket',wall:'a plain wall or blank surface'};
export const BORING=['objects','event','clothes','appliance','potware','furniture','hair','gadget','market','jewel','shoes','incar','accident','wall','tv','fridge','ac','fan','decor'];
export const JUNK={
 shot:'a screenshot of a phone app or chat conversation',game:'a screenshot of a video game',qr:'a QR code or barcode',poster:'a poster or flyer full of text',
 meme:'a meme or text graphic',doc:'a document, receipt or page of text',tech:'electronic equipment, sound bar, circuit board or repair work',
 tools:'tools, machinery or hardware',gun:'a gun or weapon',screen:'a computer monitor or a phone screen close-up',chart:'a diagram, chart or infographic',ad:'an advertisement or product banner',blurry:'a blurry, out of focus or unclear photo',target:'a red target, bullseye, hit marker or crosshair graphic',injection:'a syringe, needle or a medical injection',medical:'medical equipment, pills, a hospital bed or a doctor treating a patient',ugly:'an ugly, boring, meaningless, badly composed photo'};
export const MOOD={moody:'a moody cinematic dark atmospheric photo',bright:'a bright cheerful colourful photo',pastel:'a soft pastel aesthetic photo',bw:'a black and white photograph',film:'a vintage film photo with warm grain'};
// pairs: [good, bad] -> beauty score
export const BEAUTY=[['a stunning, beautiful, professionally composed photo','a boring, ugly, messy, poorly composed photo'],['an aesthetic high quality photo','a dull low quality snapshot'],['a vivid dramatic breathtaking image with rich colours, striking light and a clear subject','a flat plain dull image with no clear subject']];

// Face quality pairs [good, bad] (used as a backup when the face-detector can't load)
export const FACE=[['a person with eyes wide open looking straight at the camera','a person with eyes closed or looking away'],['a person with a gentle natural smile','a person with a blank, grumpy or awkward expression'],['a well posed flattering portrait of a person','an awkward badly posed unflattering photo of a person']];
