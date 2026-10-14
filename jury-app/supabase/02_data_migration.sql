-- Shared Ground Jury App -- one-time data migration from the Jury Google Sheet
-- into Supabase (Users, Submissions + pre-resolved image URLs, Votes).
-- Generated from a full export of the live sheet; run this once, AFTER
-- 01_schema_and_functions.sql has been run, in Supabase's SQL Editor.
-- Safe to re-run: every INSERT upserts on the primary key.


-- Users (6 rows)

insert into users (id, username, password, role, name, finalized, finalized_at) values (
  'U-admin', 'admin', 'admin123', 'admin', 'Competition Administrator', FALSE, NULL
) on conflict (id) do update set username = excluded.username, password = excluded.password, role = excluded.role, name = excluded.name, finalized = excluded.finalized, finalized_at = excluded.finalized_at;

insert into users (id, username, password, role, name, finalized, finalized_at) values (
  'U-juror1', 'patricia', 'patricia123', 'juror', 'Patricia Millns FRSA', FALSE, NULL
) on conflict (id) do update set username = excluded.username, password = excluded.password, role = excluded.role, name = excluded.name, finalized = excluded.finalized, finalized_at = excluded.finalized_at;

insert into users (id, username, password, role, name, finalized, finalized_at) values (
  'U-juror2', 'jalal', 'jalal123', 'juror', 'Jalal Luqman', FALSE, NULL
) on conflict (id) do update set username = excluded.username, password = excluded.password, role = excluded.role, name = excluded.name, finalized = excluded.finalized, finalized_at = excluded.finalized_at;

insert into users (id, username, password, role, name, finalized, finalized_at) values (
  'U-juror3', 'khalil', 'khalil123', 'juror', 'Khalil Abdulwahid', FALSE, NULL
) on conflict (id) do update set username = excluded.username, password = excluded.password, role = excluded.role, name = excluded.name, finalized = excluded.finalized, finalized_at = excluded.finalized_at;

insert into users (id, username, password, role, name, finalized, finalized_at) values (
  'U-juror4', 'manish', 'manish123', 'juror', 'Manish Mundra', FALSE, NULL
) on conflict (id) do update set username = excluded.username, password = excluded.password, role = excluded.role, name = excluded.name, finalized = excluded.finalized, finalized_at = excluded.finalized_at;

insert into users (id, username, password, role, name, finalized, finalized_at) values (
  'U-juror5', 'robin', 'robin123', 'juror', 'Robin Corcos', FALSE, NULL
) on conflict (id) do update set username = excluded.username, password = excluded.password, role = excluded.role, name = excluded.name, finalized = excluded.finalized, finalized_at = excluded.finalized_at;


-- Submissions (146 rows)

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-0001', 'Pan Pan Thaw', '971545028204', 'isabellebele1999@gmail.com', 'Yes',
  'Nostalgia', 'Painting', 'Acrylic on canvas', '50* 70cm', '2026',
  'This painting is inspired by a reflection on home, 
nature, memory and the relationship between me and  the land.
Short ', 'Artist Biography: I grew up and raised in Burma which is a small 
country rich in culture and nature. I have been learning realism since I 
was young. Mostly, my paintings always reflect our culture and way of 
living back there in my country.', 'IMG_9501.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1luNs4Y3tzuv1lVvP2EndkhnVW3eHbW2i&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-0002', 'Dr Kasia Sterriker', '971 50 982 2781', 'me@drkasiasterriker.com', 'Yes',
  'Gaia', 'Sculpture', 'Live Carved Olive tree, natural finish', '210x130x120 cm', '2026',
  'Beyond Bonsai living sculpture. An ancient olive carved 
into biophilic forms and shaped with inherited bonsai techniques.', 'Polish-British published scientist,  Environmental 
artist, and Bonsai Rebel known for her Living Sculptures based on Bonsai 
Art.

Taught by her father, she is rooted in tradition yet grows beyond it.  Her 
work transcends traditional Bonsai forms, showcasing the dynamic 
relationship between nature and humanity whilst promoting understanding of 
survival, growth, and regeneration.

Beyond Bonsai sculptures inspire introspection and encourage viewers to 
reflect on their roles as custodians of the environment.', 'Gaia Art Statement.pdf', TRUE, '',
  'file', 'https://drive.google.com/file/d/1LPOsTOEPkrgpUSTByiaxLXBCTbvbfFoS/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-0003', 'Sanaa kiblawi', '506597171', 'Sanaa.kiblawi@gmail.com', 'Yes',
  'Peace', 'Painting', 'Acrylic', '90*90', '2026',
  ' This artwork highlights motherhood, peace, and cultural 
identity. It depicts a protective mother nurturing children, knowledge, and 
Arabic heritage.', ' sanaa kiblawi... I am a visual artist who expresses 
women and their issues in
society through my work. I paint them as a symbol of strength, identity, and
daily struggle. My paintings are not just visual aesthetics, but messages 
that
carry women''s voices and reflect their reality, dreams, and rebellion. I
believe that art is a responsibility, and I use it as a means of expression,
confrontation, and change.', 'CamScanner 11-05-2025 02.23.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1ZcxBHE1W7FlXODHM1IiriJirgME9xidR&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-0004', 'Sophia Van Der Bank', '971586373718', 'mrs.helichrysum.stories@gmail.com', 'Yes',
  'A Popsicle On a Hot Summer''s Day.', 'Painting', 'Acrylics and Oil Pastels on Canvas', '67x91', '2026',
  'I paint as a way of noticing: flowers growing where they 
should not...', 'I am a 30-year-old, self-taught artist originally
from South Africa, now working from Dubai under the name Mrs. Helichrysum.

The name is inspired by the hardy yellow helichrysum blooms that grow
abundantly in the landscape where I come from.

Mrs. H is recognisable by her signature orange nose and distinctive
black-and-white striped stockings. Birds are recurring characters
throughout my work, symbolising truth and acting as quiet witnesses within
each scene.

My work is rich in colour, pattern and storytelling, drawing inspiration
from nature, femininity, animals, modesty and the beauty of everyday life.

Through whimsical characters and vibrant compositions, I explore innocence,
beauty, hope and the little pockets of wonder that can still be found in an
imperfect world.

@mrs.helichrysum', 'inbound621083023911956347.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1otciUKpqDx3gnZWu8xPr3IQIcIe1xBGz&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-0005', 'Olena Kucher', '971561455659', 'kucher348@gmail.com', 'Yes',
  'Thoughts', 'Painting', 'Acrylic on paper', '46x62', '2026',
  'By merging classical realism with raw abstraction, 
*Thoughts* shows the quiet tension of being present within oneself while 
navigating ones mind.
Short ', 'Artist Biography: Artist from Ukraine, based in Dubai. Emotions, 
beauty, travels, and nature inspire my art. Using graphics, acrylics, & 
mixed mediums to explore the heart''s depths. Join me on this creative 
journey!', 'IMG_2383.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1HcqPPV1InCZqeNI8c-j0ImG6fUr5EVIg&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-0006', 'Mariam Mohamed Gamal', '523312811', 'mariamjamal525@icloud.com', 'Yes',
  'The little ones', 'Painting', 'I’m no on paper', '50*30 cm', '2025',
  'The Little Ones explores loneliness and displacement, 
revealing the child within us that still longs for warmth, family, 
belonging, and an embrace.', 'Short Artist Biography: I am an Egyptian visual artist and illustrator 
based in the UAE. Through hand-drawn and digital art, I explore 
storytelling, emotions, and the imaginative worlds shaped by memory and 
experience. My work often reflects the connection between our inner worlds 
and the stories we carry with us.', 'The little ones by Mariam Gamal .pdf', TRUE, '',
  'file', 'https://drive.google.com/file/d/1GGNGO0sY7s-239dOu904idE1HMGPyPR7/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R8', 'Sasan Nasernia', '971508882598', 'naserniasas@gmail.com', 'Yes',
  'Ascendant', 'Painting', '', '100x80cm', '2026',
  'DIWAN carries Rumi''s opening verses in Kufi Banaai — a 
script built into walls. A tear runs through it. A suggestion of a 
permanent, silent presence.
', 'Short Artist Biography: Sasan Nasernia (b. 1974, Tehran) is a 
multidisciplinary artist working across painting, installation, print, and 
digital media. Rooted in Persian and Arabic calligraphic traditions, his 
practice is distinguished by "Crazy Kufic" — a deconstructed calligraphic 
language derived from the earliest Kufic forms. His work navigates the 
tension between order and chaos, tradition and experimentation, language 
and abstraction, drawing on Sufi metaphysics, Persian iconography, and 
contemporary philosophy. He has exhibited internationally across the Middle 
East, UK, and North America.', 'inbound8314388506175232450.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1N2i8uDwvC4d0eXbZIwdoYHOhBJgla0sn&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R9', 'Doaa ‏khairy', '561124797', 'doaakhairy625@icloud.com', 'Yes',
  'lion woman', 'Painting', 'oil on canvas', '50x60cm', '2025',
  'This artwork celebrates the inner strength of every 
woman, where beauty and resilience bloom like flowers, revealing the power 
that lies within.
', 'Short Artist Biography: My name is Doaa Khairy Atiya, an Egyptian visual 
artist and art workshop facilitator based in Dubai. I am reaching out to 
express my interest in participating in the Arab Media Summit in Dubai and 
becoming part of this inspiring media and creative community.

I work as a visual artist, creating expressive paintings that combine 
realistic elements with emotions, femininity, identity, and personal 
stories. Alongside my artwork, I conduct creative art workshops for 
children, adults, and women, including acrylic, oil, pencil drawing, and 
creative painting experiences.', 'FFBEC75F-2F73-42FD-B117-ADAED8928BA7.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1Q_12LYAarmm1xKmBiDAbGovXU8VJIDcS&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R10', 'Natalia Leanca', '585849531', 'bestcuart.gallery@gmail.com', 'Yes',
  'Spirits of the Universe', 'Painting', 'Acrilic on canvas', '61 x 61 cm', '2024',
  '24 paintings - energetic mandalas was created in deeply 
meditations with love. The main elements is heart, star and Chinese   
hieroglyphs
', 'Short Artist Biography: Natalia Leanca - Scientist in arts, artist
Participated in Summits Awards Charity Auctions, taken place in Dubai 
Okappi art gallery in 2019.
Use different artistic techniques oil on canvas, acrilic, pastel.', 'image.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1F8XkGXBcS7XKjqvHTeuv2Ysua1X343j4&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R11', 'teng miras', '971566301432', 'tengmirasdxb@gmail.com', 'Yes',
  'fragments of life', 'Painting', 'mixed media', '60x60', '',
  'Mixed-media artist exploring memory, emotion, and 
transformation through layered, one-of-one works made with reclaimed 
materials.', 'Teng Miras is a UAE-based multidisciplinary artist 
working across mixed-media painting, sculpture, textiles, lamps, and 
upcycled materials. Their practice explores fragments of life, memory, 
emotion, and transformation through texture, layering, stitching, and 
reclaimed materials. Teng creates intuitively and on the spot, developing 
new designs that are always one of one. Each work becomes a visual story 
shaped by the materials, process, and moment of creation.', '5476D29D-A099-46E7-8004-1CE0545B4CAC.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1SGmlPZ2fln-_1AKJlwhLrKo_7svQYCWB&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R12', 'Irish Ponce', '553452165', 'irishpduran1990@gmail.com', 'Yes',
  'MEDUSA ᜋᜒᜇᜓᜐ', 'Painting', 'Mixed Media', '800mm Round canvas', '2023',
  'MEDUSA ᜋᜒᜇᜓᜐ
THE FEMALE GAZE PETRIFY THE PATRIARCHY
', 'Short Artist Biography: Irish Ponce is a Filipino visual artist based in 
the United Arab Emirates, known for portraiture in graphite and oil. After 
a quiet period following college, she revived her practice after moving to 
Dubai in 2017, embracing art as a lasting passion.

Ponce''s meticulous eye for human expression has made her a sought-after 
portrait artist, and she has since expanded into mural art and photography. 
Her graphite work highlights technical precision, while her oil paintings 
reveal her growth as a painter.

Beyond commissions, Ponce teaches workshops that nurture Dubai''s creative 
community. Her journey reflects the persistence of authentic creative 
expression amid life''s practical demands—a theme that continues to shape 
her work.', 'IMG_8982.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=14aSYbbfn053s4ESWmr9cbReRppwqTRjX&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R13', 'Heidi Schröder', '971 56 630 2121', 'artbyheidii@yahoo.com', 'Yes',
  'Paradise Garden', 'Painting', 'Acrylic', '100 x 70', '2025',
  'Paradise Garden
In Paradise Garden I explore the idea of passion and movement.
This painting is 103 x 73 cm, framed.
', 'Short Artist Biography: Heidi Schroeder, known artistically as Artbyheidii, 
creates expressive works that reflect resilience, movement, and a deep 
appreciation for life’s evolving rhythms. She signs her paintings with the 
name “Kull,” a tribute to her maiden name and a signature she has used 
since completing her very first piece. This personal detail remains a quiet 
but meaningful connection to her artistic beginnings.
Her path to becoming an artist was not a direct one. After completing a 
high school diploma in design, life led her in a different direction 
following the early loss of her parents. She pursued professional training 
in accounts receivable and accounts payable, as well as foreign language 
correspondence, later complementing her knowledge with distance studies in 
business administration. Her career included many years in the 
telecommunications industry, followed by nearly two decades in consulting, 
and most recently work in data protection.
A significant turning point came when she relocated abroad with her family. 
The sudden shift from an intensely busy professional life to a slower pace 
brought unexpected challenges, including a serious health diagnosis. During 
treatment, she returned to painting, using it as a form of therapy and 
emotional expression. Through this process, creativity became both a refuge 
and a source of strength.
Now cancer free, Heidi Schroeder approaches her art with renewed passion 
and gratitude. Her recent work explores the theme of movement, expressed 
through layered textures, subtle three dimensional effects, and flowing  
colors. Gold often plays a central role in her compositions, symbolizing 
elegance, depth, and light. Her paintings invite viewers to see motion 
within structure and emotion within color, offering a visual experience 
that is both dynamic and deeply personal.', 'IMG_8743.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1OEz3J56aQkew5m34_qB1bw6oW6CQz7xK&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R14', 'Susan Brooker', '971505506618', 'susan_brooker@hotmail.com', 'Yes',
  'Rewilding', 'Painting', 'Oil on Canvas', '70 x 100 cm', '2026',
  'my first painting after years as a busy 
working single mum. A figure emerging, breathing, reclaiming space to grow 
wild again.
', 'Short Artist Biography: Sue is a British artist who has called the UAE home 
for over 20 years. After years balancing a corporate career with raising 
her child as a single mum, she left the corporate world in 2026 to dedicate 
herself to art full-time.

Her return to oil painting began with Rewilding (2026), her first canvas 
after a long break. Working in a restrained monochrome, she contrasts 
finely sculpted figures with loose, gestural brushwork, exploring themes of 
release, renewal and reclaiming space for oneself.', 'IMG_3392.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1E_1PRQMiKgukE-Ji4zhbqjT_Svmw6CPg&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R15', 'Fatima Sherjan', '971 52 998 5029', 'lil.lambi@gmail.com', 'Yes',
  'Sufficient for us is Allah, and [He is] the best Disposer 
of affairs', 'Painting', 'Acrylics on canvas', '150x150 cm', '2024',
  'My work combines Arabic calligraphy and abstraction to 
explore faith, hope and renewal through layered colour, texture and 
expressive mark-making.
', 'Short Artist Biography: Fatima Sherjan is a Dubai-based visual artist whose 
practice moves between abstract florals, layered textures and Arabic 
calligraphy. Her work explores themes of nature, beauty, fragility, faith 
and resilience through intuitive mark-making, expressive colour and 
atmospheric compositions. Drawing inspiration from flowers, landscapes and 
spiritual text, she creates dreamlike works that invite reflection, hope 
and connection.', 'IMG_5154.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1JpY4uzrI8WBevDupb9g8hmKPU1CfI1cr&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R16', 'Aqil Manoj', '971569605920', 'aqilmanoj@hotmail.com', 'Yes',
  'Hug Proof Jacket', 'Sculpture', 'Recycled Cardboard', '21" x 12" x 26"', '2024',
  ' A wearable sculpture made entirely out of repurposed 
Cardboard. Outward spikes and five finger-like forms suggest both 
protection and restraint.
', 'Short Artist Biography: As an artist, I am constantly experimenting to 
discover what my work can become. Design has always
been my focus, and I am motivated to refine it in ways that connect 
meaningfully with the real world.
Most of my creative development has been self-taught, and over time, I have 
pushed my work beyond the
sketchbooks and into canvas-based and three-dimensional exploration. I 
approach drawing with an
emphasis on movement and composition rather than strict representation, 
always searching for stronger
ways to communicate through form.
Through art, I have learned that discomfort can be freeing and that 
trusting the process builds
confidence. I am inspired by artists beyond architecture, especially 
photographers like Jack Bridgland,
whose visual language continues to shape my understanding of atmosphere and 
perspective.', 'IMG20241204235009.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1A1g-B4KWGTlJzAHYPhWIR6PCumXSURiP&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R17', 'Khouloud Chehade', '544900977', 'khouloudch@hotmail.com', 'Yes',
  'A Mother', 'Painting', 'Acrylic on canvas', '60 by 120 cm', '2025',
  'The pride and emptiness when children leave 
home, and the quiet search to find its rhythm again. They carry pieces of 
her heart with them.
', 'Short Artist Biography: I am a Lebanese artist whose passion for visual 
arts began at the age of ten, when my family first recognized my talent.
With roots in Mazboud, Mount Lebanon, and a childhood spent in Saudi 
Arabia, my work is shaped by a multicultural upbringing and a deep 
connection to home, family, and human experience.

I hold a degree in Interior Design with a minor in Fine Arts Painting from 
the Lebanese American University in Beirut. My background in both 
disciplines has shaped the way I see art, allowing me to combine 
composition, space, color, and form with emotional storytelling.

My work explores themes of human connection, motherhood, family, kindness, 
hope, and the meaning of home. I create intuitively, drawing from personal 
experiences and emotions, while leaving space for each viewer to find their 
own meaning in the work.

I believe art can communicate what words sometimes cannot. For me, a 
painting should speak to you, express something within you, and become a 
statement of what you believe and value. Through my art, I hope to create 
moments of reflection, emotion, and connection in a world that often moves 
too quickly.', 'IMG_6035.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1yvmozC-rbaNl068jE5qUBS1nvwq21pTk&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R18', 'RASHED ALHOSANI', '971552006355', 'r2000rhh@hotmail.com', 'Yes',
  'Afternoon coffee', 'Painting', 'Acrylic paint', '100cm x 70 cm', '2026',
  'A summer in uae always comes with date season along with 
an Arabic coffee
', 'Short Artist Biography: As a Chemical Engineering graduate from
Khalifa University and a self-taught artist, I
have always been drawn to both analytical
thinking and creative exploration. My
artistic practice combines traditional
painting with digital illustration and
design, allowing me to experiment across
different mediums and styles. Influenced
by contemporary art and the cultural
richness of the UAE, my work often
incorporates local symbols, landscapes,
and everyday experiences, reimagined
through simplified forms, bold
compositions, and modern visual
language. Through each piece, I seek to
bridge tradition and contemporary
creativity while expressing my own
perspective on culture, identity, and place', 'IMG_9931.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1nFFMvq9czzdC17CRD8f0rR-kCWwFcjy1&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R19', 'Sehar Hashmi', '971554979906', 'sehartstudio2710@gmail.com', 'Yes',
  'Surrounding', 'Painting', 'Gouache on wasli', '21.5x5 cm', '2024',
  'Art is putting things in the right place resilience over
barriers, truth before flowers, seeking light as active conviction, not
passive hope.
', 'Short Artist Biography: My artistic work focuses on elevating miniature
painting beyond its historical Mughal portraiture into a vibrant
contemporary art form. This mission has taken my work to international
platforms, including the solo exhibition "Rise" at Karachi Art Gallery and
group shows in Dubai, Beijing, Iran, and Argentina. Being selected as
Pakistan''s sole representative at the Beijing Art Festival stands as a
particular honor in my career. These experiences have deepened my belief in
art''s power to foster cross-cultural dialogue while preserving traditional
techniques.', 'Sehar-Hashmi-Paintings-and-Artist-Statement.pdf', TRUE, '',
  'file', 'https://drive.google.com/file/d/1UVh4RC2DYVq1gqqBfOTt48cYerjZhGVb/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R20', 'Fatima Nadia Rehman', '503951974', 'nadiarehman74@hotmail.com', 'Yes',
  'Connection', 'Painting', 'Mixed media', '110cm by 130cm', '2026',
  'Shared Ground brings blue—the sea, sky, and 
space—together with language, creating a meeting place for connection, 
identity, and belonging.
', 'Short Artist Biography: Dubai-based Mughal miniature artist, Arabic 
calligrapher, and art educator with 17+ years of experience in fine art, 
cultural programming,
public commissions, luxury collaborations, and bespoke client work. Trained 
in Visual Communication and Mughal Miniatures and
Calligraphy, I combine Arabic script, heritage research, handmade 
processes, and contemporary design.
I am now developing a jewellery practice informed by the rhythm, geometry, 
and symbolism of Arabic calligraphy, Mughal ornament, and
regional cultural heritage, seeking to expand this visual language through 
jewellery and watch design, material exploration, prototyping, and
luxury craftsmanship.', 'b422b5dc-e0f8-4c16-85f3-c1a4baf218f8.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1VArJPRNd0szvSPQy-xqX9KSIVaCjsGxG&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R21', 'Farva Nadim', '971585542088', 'farvanadim@gmail.com', 'Yes',
  'Roots', 'Painting', 'Oil & Acrylic on Canvas', '50x75 cm', '2026',
  'Merging maps of Lucknow and Dubai converge at a single 
point that creates the Self. Incorporated elements from both lands question 
belonging and roots
', 'Short Artist Biography: Farva is a multi-disciplinary writer, artist and 
independent researcher. She is also the creator of Nirvana Mail - a monthly 
subscription chain of handcrafted memorabilia. In her work “Roots,” she has 
used intertwined cartographies and elements like Talli embroidery, Mughal 
motifs, currency notes, as well as palm and banyan tree notes that ask how 
we place our feet in shifting sands.', 'IMG_2716.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1XADx3DBGWjfAZDxmjO1vqwmK3GsGkrT2&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R22', 'Samar Ziadeh', '971504355580', 'samarziadeh79@gmail.com', 'Yes',
  'Conscious and Subconscious', 'Painting', 'Hand-embroidered cotton threads on textile, acrylic', '210cm × 135 cm', '2025',
  ' In Dubai, our cultures share a collective unconscious. 
Stitched without drawing, color holds the subconscious; pattern is where 
our differences meet>
', 'Short Artist Biography: Dr. Samar Ziadeh is a Lebanese contemporary artist 
based in Dubai. Shaped by her research on the geometry of Arab-Islamic 
ornament, she stitches memory, resilience and transformation into 
hand-embroidered works, treating pattern as the way the self becomes 
visible. She holds a PhD in Art and Sciences of Art and a Master''s in Fine 
Art, and taught for thirteen years at the Lebanese University, the American 
University of Science and Technology and Dar Al-Uloom University. Her work 
has been exhibited in Beirut, Riyadh and Muscat, and is held in the 
collection of the Misk Foundation and in private collections.', 'IMG_1611.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1jGKHXx03tc9R5JO_x0F-psNCaqCc6jGY&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R23', 'Aparna Mohan', '971567262201', 'aparnasreejith835@gmail.com', 'Yes',
  'Carried Across Borders', 'Painting', 'Acrylics on Canvas', '90cm *135cm', '2026',
  'In this self-portrait, origami birds bear memories 
carried across borders, taking flight through a red window towards the 
sanctuary  in the UAE.
', 'Short Artist Biography: Aparna Mohan is an Indian contemporary figurative 
artist based in Sharjah, United Arab Emirates. The daughter of a Military 
Nursing Service officer, her early life was defined by constant relocation, 
instilling in her a deep fascination with how memory, identity, and story 
travel across geographical boundaries. After earning her Master’s degree in 
Biotechnology and working as a science educator, she fully transitioned her 
analytical background into a rich, narrative visual arts practice.
Her paintings—primarily in acrylics and mixed media—interweave expressive 
figurative portraiture with recurring symbolic motifs, including 
handwritten scripts and folded origami forms. Working across traditional 
and unconventional canvas shapes, Aparna’s work explores the intersections 
of personal sanctuary, cultural exchange, and human presence. Having called 
the UAE home since 2010, her artwork frequently reflects on the themes of 
migration, belonging, and the quiet resilience.', 'Carried_ across _borders.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1HaXDhtdQABoX5cHUHnmu7mc31ep_CcOl&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R24', 'Samaneh Riazati', '524123350', 'samanehriazati3@gmail.com', 'Yes',
  'Sarv e siavash', 'Painting', 'Mix Media ( acrylic, gold paper, Thread', '124*157 Double-sided artwork', '2024',
  'Sarv-e Siavash: the cypress as a symbol of memory, 
identity, and belonging.Its roots embody resilience and cultural memory.
', 'Short Artist Biography: Samaneh Riazati is a contemporary Iranian artist 
based in Dubai. Her practice explores identity, memory, nature, and 
cultural heritage through layered abstract works, combining acrylic, 
pastel, and mixed media. Her paintings reflect a dialogue between Persian 
heritage and contemporary experience.', 'NBF_Submission.pdf', TRUE, '',
  'file', 'https://drive.google.com/file/d/124KyQOwnb1h20jPd1OkvzDApsydN9WI5/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R25', 'Asma Ghani', '971508940231', 'asmaghani6786@gmail.com', 'Yes',
  'Bloom in Ruin', 'Painting', 'Mixed media on canvas', '60x90 cm', '2025',
  'Women have long faced challenges, yet they continue to 
strive in various fields
This painting has objects that serve as rich symbols of womanhood.
', 'Short Artist Biography: Asma Ghani is a freelance fine artist, muralist and 
calligrapher based in Ajman, UAE. Working across
acrylic, mixed media and watercolour, her practice moves fluidly between 
Islamic calligraphy,
contemporary pop art, seascapes and travel-inspired scenes, alongside 
custom murals and bespoke
commissioned pieces.
She is an optimistic, self-motivated artist with strong leadership and 
communication skills, known for
being observant, proactive and resourceful — bringing the same care to a 
gallery installation as to a
one-off commission for a private client.', 'IMG_4565.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1ooQByKy1jwd3zqkHbgvWQQykWM1YkWdE&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R26', 'Ahmed Mamoun', '521312849', 'ahmed.e.mamoun@gmail.com', 'Yes',
  'Hussein Al Jasmi', 'Painting', 'Charcoal', 'A4', '2021',
  'Realistic drawing of Emirati singer Hussain Al Jasmi
', 'Short Artist Biography: Charcoal artist for over 10 years', 'inbound4993768320832512930.png', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1CQEXKO7u8h7vstlAPjiQCYAaz0VIlIhr&sz=w1600', 'image/png'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R27', 'Janara Jones', '971 56 412 9162', 'janarajones@gmail.com', 'Yes',
  'THRESHOLD', 'Painting', 'Acrylic on Canvas', '120*90*4cm', '2025',
  'A diptych exploring division, readiness, and 
transformation through shared light, showing different worlds drawn toward 
the same meaning.
', 'Short Artist Biography: I am a Dubai-based multidisciplinary artist, 
fashion and textile designer, and creative director. My practice explores 
the connection between art, identity, fashion, and visual storytelling.

Originally from Kazakhstan, I moved to Dubai in 2010, where I became 
inspired by the region’s culture, traditions, and distinctive relationship 
with fashion. This led me to begin creating my own designs and eventually 
develop a creative practice that extends beyond clothing into painting, 
textiles, print, and interior applications.

I am drawn to bold colour, expressive patterns, and imaginative imagery. I 
enjoy transforming my original artworks into textiles and immersive visual 
experiences, allowing my work to exist across different mediums and spaces.

My work is rooted in individuality and authentic self-expression. Through 
my practice, I aim to create vibrant, imaginative pieces that encourage 
people to embrace colour, creativity, and their own sense of identity.', 'THRESHOLD.png', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1CRR2E3Puuu0wrnzzq3ZrsFahEWI9OuD5&sz=w1600', 'image/png'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R28', 'Dina Samuel Nasr', '971585585311', 'dondoosamuel@gmail.com', 'Yes',
  'Hidden', 'Painting', 'Oil on Canvas', '30×30 cm', '2026',
  'Investigating contemporary identity, I explore the 
intersections of historical narratives, cultural memory, and personal 
experience.', 'Dina Samuel is a Dubai-based visual artist, 
university lecturer, and Fulbright alumna with over 15 years of active 
studio practice and 8 years of higher education teaching experience. Her 
work has been presented in solo exhibitions across the United States and 
Egypt, alongside international artist residencies.', 'inbound1408929204525970540.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1x-27Hoi1dbdM4E0XV-vDC-I7uTtG0Hd-&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R29', 'Abeer rantissi', '971507680172', 'abeesrjum@hotmail.com', 'Yes',
  'Morrocan lady', 'Painting', 'Oil on Canvas', '60*70', '2025',
  'This artwork inspired by the morrocan beauty of a lady 
who visited Morroco and wear the traditional clothes of Morrocan', ' I am Jordanian Artist based in Dubai , winner of so 
many art competitions one of them in 2020 in world art dubai', 'IMG_0131.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1ngrQUT4N7Los8q7se4mx6nWbOndHOsmN&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R30', 'فائزة محمد حسن', '504507774', 'faezealamiri@yahoo.com', 'Yes',
  'My imaginary village', 'Painting', 'Oil and acrylic on canvas', '100 by 100 cm', '2025',
  'I dreamt of this UAE village, felt its voices and 
memories, and painted it to preserve a feeling of home and what I bring to 
it.', 'Faezeh Mohammed is an Emirati artist based in 
Sharjah, whose work reflects a deep connection to culture, emotion, and 
visual storytelling. She began her artistic journey exploring 
Impressionism, where she developed a sensitivity to light, colour, and 
atmosphere. Over time, her practice evolved toward Realism, allowing her to 
convey detail, depth, and human emotion with greater precision.
She has participated in numerous exhibitions locally and internationally, 
building a strong presence in the contemporary art scene. Her work has been 
recognised through several prestigious platforms and awards, including the 
Peru Biennial, Brazil Biennial, Euro Expo Art, Vernice Art Fair in Italy, 
ADIHEX, and World Art Dubai (WAD), UNESCO art camp Andorra, Qatar katara 
festival, Jeddah Saudi ... In addition, Faezeh has held two solo 
exhi-bitions, marking significant milestones in her artistic career.
Inspired by heritage, identity, and everyday experiences, her work often 
bridges tradition and contemporary
expression. Through painting and visual exploration, Faezeh aims to 
communicate stories that transcend language, inviting viewers to reflect, 
feel, and connect.', 'IMG_4505.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1wgKdvPWSi4_ZzeBVE4O0Nr5AAj75toTO&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R31', 'Archana Tanna', '971552463501', 'tannaarchana@gmail.com', 'Yes',
  'DIFFERENT, YET SAME', 'Painting', 'Pigments and Oils on canvas', '85 by 100 cms (hexagon)', '2020',
  'We may follow different paths, carry different 
stories,see the world through different eyes,yet beneath these differences 
lie stories that connect us.
', 'Short Artist Biography: Archana Tanna is a Dubai-based multidisciplinary 
artist and textile designer whose creative practice spans painting, design 
and art-led healing. A graduate of Sophia College, Mumbai, she has been 
exhibiting her work for over a decade, with participation in exhibitions in 
India and internationally. Her work explores themes of identity, 
connection, belonging and the shared human experience. She works 
intuitively with layered marks, handwritten text, symbols, maps and 
abstract forms, often creating visual narratives that invite personal 
interpretation.', 'IMG_4292.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1hh-ZSm_wH0ve-g5CZ-WJhHSxrVVa-We6&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R32', 'Sara adly Ibrahim', '971509908425', 'sasoo.adly@gmail.com', 'Yes',
  'Pores  of memory  مسّام الذاكرة', 'Painting', 'Oil painting', '90*130 cm', '2026',
  'اعمل  على سلسلة لوحات مرتبطة بروايتي، أفكك التجربة 
النفسية لإعادة صياغة الواقع عبر رؤية شخصية، دامجة السرد والواقعية الخيالية 
بالألوان الزيتية .
', 'Short Artist Biography: I am Sara Adly, an Author and artist, holding the 
Golden Visa in the UAE and a member in Emirates fine art art, I  have 
pursued various independent studies in painting and drawing. I have 
participated in exhibitions in Dubai, and sharjah art museum with my work 
focusing on expressing deep human emotions through color and texture, 
incorporating mixed-media techniques that reflect my connection to personal 
experience and emotional expression. In addition to my artistic practice, I 
work in the field of therapeutic storytelling, integrating art as a tool to 
enhance self-awareness in children and adolescents.', 'IMG_4257.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1aBNBMUUBi8svVxKzydVHgc1p1M4If_Y9&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R33', 'K U Anupama', '971547007583', 'anupamaudayakumar4@gmail.com', 'Yes',
  'Between Earth & Sky', 'Painting', 'Acrylic and plaster of paris on a canvas', '60 x 90 cm', '2026',
  'A story of becoming: staying rooted in who we are while finding the courage to move forward, grow, and embrace the unknown.', 'I’m an emerging artist based in Dubai, drawn to 
colour, texture and the stories hiding beneath everyday life. My work is 
intuitive, expressive and occasionally a little chaotic — a reflection of 
my curiosity, emotions and the constant process of figuring myself out. I 
paint what I feel, what I notice, and sometimes what I can’t quite put into 
words.', 'IMG_9740.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1zE8ILZGaD7bNZCchFUTBx7AhUlFuCWmk&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R34', 'Saeideh Amir abdollahian', '554133398', 'saeidehamir81@gmail.com', 'Yes',
  'Whispers of the Earth', 'Painting', 'acrylic on canvas', '90x120 cm', '2026',
  ' A poetic interpretation of the UAE desert, where earthy 
tones, flowing forms, and quiet textures capture its timeless rhythm, 
warmth, and silence.', 'Saeideh Amir Abdollahian
Iranian Conceptual Photographer & Visual Artist | Based in the UAE

Saeideh Amir Abdollahian is an Iranian conceptual photographer and visual 
artist based in the UAE.

She holds an M.A. in Visual Arts (Painting) from Yazd University (2016) and 
a B.A. in Painting from Tabriz University (2008). Her work has been 
presented in solo and group exhibitions in Iran, Turkey, and the United 
States', 'IMG_8740.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=16pZVCss1O7AqbuZTfXGzurxy6W4APfb9&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R35', 'Nirmeen hashim', '971557203011', 'nirmeen.hashim@yahoo.com', 'Yes',
  'أرض تجمعنا', 'Painting', 'الوان اكريليك ع كانفس .رمل', '90×120', '2026',
  'تجسد اللوحة «الأرض المشتركة» في الإمارات، حيث تتلاقى 
الثقافات والهويات تحت شجرة الغاف، رمزًا للجذور والانتماء والسلام والتنوع.', ' مهندسة وفنانة تشكيلية.معلمة فنون بصرية. عضوة في 
جمعية الامارات للفنون التشكيلية شاركت في عدة معارض محلية وعالمية', 'inbound7940601418880731098.png', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1Y7IDdbMhNCe-uSKev3kgJg9UNmHgGJiy&sz=w1600', 'image/png'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R36', 'Preeti Anand', '502467888', 'preetikauranand@gmail.com', 'Yes',
  'Pear and Grape', 'Painting', 'Oil on canvas', '25x20cm', '2026',
  ' I explore the quiet poetry of nature through light, 
colour, texture, and atmosphere, transforming everyday moments into 
contemplative experiences.', ' Preeti Kaur Anand is a UAE-based Indian 
contemporary artist working predominantly in oils. A Fine Arts graduate, 
her practice explores the quiet dialogue between light, nature, and human 
experience. Through colour, atmosphere, and thoughtful observation, she 
creates works that invite contemplation and reveal the beauty within 
everyday moments.', 'IMG_9368.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1o24G2iNe-8UipZvv8j1_NVgkPnGphY9y&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R37', 'Dr. Anum Anwar Ali', '971525933103', 'anumfineartist@gmail.com', 'Yes',
  'Where We Gather', 'Painting', 'Acrylic on Canvas', '90x60cm', '2026',
  'Through the UAE Dallah, I explore heritage, hospitality, 
and the shared moments that connect people across cultures, generations, 
and borders.', 'Anum Ali is a Pakistani UAE-based artist whose 
practice explores human connection, nature, heritage, and emotion through 
painting and mixed media. Trained at the Indus Valley School of Art and 
Architecture, she works primarily with acrylic, oil, texture, and 
sustainable materials. Her work has been exhibited across the UAE and 
internationally, including World Art Dubai, Lalit Kala Art Akademi(India) 
and DIAC exhibitions.', 'IMG_1921.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=14f-PfX_jA5ejHVmVwjZD9JFeLjeiPDr6&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R38', 'Rogues Gallery (Artist)', '971501620685', 'roguesgalleryart@protonmail.com', 'Yes',
  'Colombia | Oasis', 'Painting', 'Acrylic & Spay Paint on Canvas', '61cm x 91cm', '2025',
  'British rock ‘n roll swagger in acrylic, spray paint and 
white flecks. Man City blue background nods to one of the few things the 
brothers agreed on.', 'Rogues Gallery is British artist that fires rock ‘n 
roll across the canvas. Although collectors of his work include the 
director of Burberry & the President of Michelin Star, the desire for 
people to buy his work has increased - with no paintings being offered to 
the market -as he builds up his debut collection. To date he has only 
allowed two painting to be purchased, now hanging in London & Paris.', 'IMG_8645.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1S-_U8HvTmdIyGnlqGO1nfJs4wHbRPuSX&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R39', 'Prachi Kulkarni', '971557923857', 'prac_hi@hotmail.com', 'Yes',
  'A place to grow', 'Sculpture', 'ceramic', '55 cm x 50 cm', '2026',
  'From white clay to flowing colour: this sculpture holds 
the care I received through breast cancer in the UAE, and the courage it 
helped me find.', 'Prachi Kulkarni is a Dubai based self-taught 
ceramic artist and product development chef
originally from Mumbai, India. Her sculptural ceramic practice explores 
transformation,
resilience and the relationship between nature and human experience. 
Drawing inspiration
from organic forms and the changing rhythms of the natural world, she 
creates contemporary
sculptures, lighting and functional objects that invite reflection, 
dialogue and connection.

This work is also a part of the Autumn Series. It explores movement, 
transition and healing through sculptural forms that
function as lamps, vessels and objects of reflection. Inspired by the 
shifting rhythm of autumn:
cooling air, falling leaves and quiet transformation, the works mirror my 
personal journey
through illness, recovery, and growth. Like nature in transition, the 
series embraces
imperfection, motion and renewal, reminding us that life continues to shape 
us gently and
endlessly through every season.', 'https://drive.google.com/file/d/1tDSxT1JHZdeEWl3d5MTh8ulJ9ob81ldN/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1tDSxT1JHZdeEWl3d5MTh8ulJ9ob81ldN&sz=w1600', 'image/png'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R40', 'Ayman Ayad', '97154731785', 'ayman.mohsen.ayad@gmail.com', 'Yes',
  'Union', 'Painting', 'Ink on canvas', '150×90 cm', '2025',
  'This artwork symbolizes the union of the United 
Arab Emirates through portraits of Sheikh Zayed bin Sultan Al Nahyan and 
Sheikh Rashid bin Saeed Al Maktoum. Arabic calligraphy flows through their 
headdresses and facial features, bringing the two figures together in a 
single composition. Rendered in black and white, the painting honors their 
shared vision and their role in founding the UAE.', ' I am Ayman Mohsen Ayad, a UAE-based visual artist and 
Arabic calligrapher inspired by heritage, identity, and unity.', 'https://drive.google.com/file/d/1ES0pIPRHCZDMTv6hMkQUBPs50VaS4fJs/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1ES0pIPRHCZDMTv6hMkQUBPs50VaS4fJs&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R41', 'Екатерина Kazakova', '971543038242', 'katyniakazakova@mail.ru', 'Yes',
  'After the Fire', 'Painting', 'Watercolour', '137*90', '2026',
  'A textured abstract study of silence, emotional weight 
and the strength found within darkness', 'Ekaterina Kazakova is a UAE-based emerging 
contemporary artist exploring emotion, transformation and personal 
experience through abstract painting, texture and colour.', 'https://drive.google.com/file/d/1UaZqXEHSaXMDQp7CHsjZxk66l7RgKC4I/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1UaZqXEHSaXMDQp7CHsjZxk66l7RgKC4I&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R42', 'Ayse Pinar Beser', '971585476562', 'monurbeser@gmail.com', 'Yes',
  'Guardian of the Reef', 'Sculpture', 'Ceramic', '40x20 cm', '2026',
  'A hand-built ceramic sculpture, shaped and glazed 
entirely by hand in the studio.', 'Ayşe Pınar Beser is a Turkish ceramic artist whose 
work explores the connection between nature, cultural memory, and human 
identity. Through handcrafted stoneware sculptures inspired by symbolic 
animal forms, she creates contemporary works that celebrate craftsmanship, 
storytelling, and humanity''s enduring relationship with the natural world.', 'https://drive.google.com/file/d/1rXSAuMnqsYzZUZP1ZbjoVBbYHLPfazMG/view?usp=drivesdk', TRUE, '',
  'file', 'https://drive.google.com/file/d/1rXSAuMnqsYzZUZP1ZbjoVBbYHLPfazMG/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R43', 'Nadine Moadad', '971567258484', 'nadine.moadad88@gmail.com', 'Yes',
  'Astral Whispers', 'Painting', 'Plaster and acrylic', '120x100', '2026',
  'Through plaster and acrylic, I use nature as a metaphor 
for the human condition, exploring memory, resilience, vulnerability, 
renewal and becoming.', 'My relationship with art began in Lebanon, painting 
on
glass alongside my mother learning through colour and
experimentation. As I built a career in graphic design, art
filled the hours around it: days in design, nights painting
glassware, weekends exhibiting together.
Then life changed. The premature birth of my daughter
marked a deeply transformative chapter, reshaping
how I understood life, faith, and the world. I found myself
returning to spirituality and nature, discovering the
profound connection between fragility and strength,
stillness and movement, disruption and renewal.
When I returned to painting in 2023, I brought a different
perspective. My background in graphic design shaped
my understanding of colour, composition, and visual
balance, so now my paintings now draw from the abstract
patterns already present in nature, translating its movement
into imagined emotional landscapes.
Today, I create textured mixed-media abstract paintings
in fluid colour, sculptural texture, and metallic detail
translating nature’s movement and emotion into
imagined landscapes of my own', 'https://drive.google.com/file/d/1Gu1JdjGZb3XfDZdru-SFWsfWtdQUZJdm/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1Gu1JdjGZb3XfDZdru-SFWsfWtdQUZJdm&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R44', 'Gulalek Esenova', '971551288997', 'gt.artgallery@gmail.com', 'Yes',
  'SYNTHESIS-GT', 'Sculpture', 'Recycled materials', 'H2m x 0.5m', '2026',
  'Built entirely from discarded materials - Synthesis-GT 
transforms waste into a figure suspended between human and machine.', 'Gulalek Esenova (GTnArt)
Engineer • Architect • Artist • Innovator
Gulalek Esenova (GT) is a Turkmen-born engineer-architect, visionary 
artist, and creator of the original 3D Optic Paper Art™ technique. Based in 
the United Arab Emirates since the early 2000s, she combines architectural 
precision with artistic imagination, transforming ordinary materials into 
extraordinary visual experiences.
Working across sculpture, painting, mixed media, fashion, and AI-assisted 
creative design. She is driven by one belief: art should challenge 
expectations and redefine the possibilities of material, light, and 
perception.
In 2011, after years of experimentation and inspired by a vivid dream, she 
introduced 3D Optic Paper Art™—a revolutionary artistic technique she 
describes as "Painting With Paper." Instead of using paint or drawing 
tools, every artwork is meticulously constructed from thousands of 
individually shaped paper fragments, creating remarkable depth, movement, 
and optical illusion.
Her innovative works have been exhibited internationally across the United 
Arab Emirates, France, Greece, India, Bangladesh, Turkmenistan, and beyond. 
Today, GT''s creations are recognized for their originality, exceptional 
craftsmanship, sustainable philosophy, and contemporary vision, inspiring 
collectors, cultural institutions, and art enthusiasts around the world.
For GT, every artwork begins with a single question:
"What if the impossible became possible?"


       She was honored to be appointed President of the Turkmenistan 
Department of International Action Art (IAA) by UNESCO, Greece, in 2023.
     She’s the Honorable Special Representative of the Union of Artists of 
Turkmenistan in the United Arab Emirates, 2023.
     Golden Member in Collage International Artists Club - Delhi Collage of 
Art, India, 2025.
     Awarded Spandan Ambassador - Has been designated as Spandan Ambassador 
for Turkmenistan and the United Arab Emirates, March 2025
      Honorary International Ambassador of MOCA Gandhinagar (Museum of 
Contemporary Art), India,2026

     Since 2012 She made many Solo & group Exhibitions in Dubai, Sharjah & 
Ajman Her Art several times awarded and appreciated by Dubai, Sharjah & 
Ajman Art Cultures & Police Departments, Sharjah Art, Culture & Media, 
Crown Prince of Sharjah, Ajman Chamber Commerce, Government of 
Turkmenistan, She been Member of Sharjah Arab Culture Club, Women''s Council 
of Ajman Chamber Commerce, Several times Published in Gulf, International 
Medias as Khaleej Times, Gulf News, India, French, Turkmenistan Countries 
and other articles and presented in Dubai, Sharjah, Abu Dhabi, India, 
Bangladesh Television programs.

                                     AWARDS and ACHIEVEMENTS

- My Special and first ever Solo Exhibition in UAE - Arab Cultural Club of 
Sharjah, 2012 (Certificate of Appreciation);
- Participated in Exhibition “Made in UAE”, EXPO Centre of Sharjah, 2013, 
Personal Appreciation of Crown Prince of Sharjah;
- Exhibition with Ajman Women''s Council & Minister of Youth, Ajman, UAE 
2014;
- Participated in Art & Fashion Exhibition in EXPO Centre of Sharjah, 2015;
- Invited to CHARITY AUCTION, GALA DINNER, organized by “Breathing Numbers” 
by Muna Harib, H Hotel, Dubai, 2015; My Masterpieces “HUNGER” and “Prayers 
House”, sold in auction for charity to help Syrian refugee children.
- Participated in Dubai Art Fair, 2015;
- Invited & Participated in Art & fashion Show in Marriott Hotel, 2015, 
Dubai;
- Participated in Ramadan Exhibition with Ajman Police, 2015, Ajman 
(Certificate of Appreciation & Trophy Award for Unique Car Art Project);
- Participated in Ajman Festival, 201,6, Ajman (Certificate of Appreciation 
& Award for Unique Car Art Project);
- Participated in Ramadan Exhibition with Ajman Police, 2016, Ajman 
(Certificate of Appreciation & Trophy Award for Unique Car Art Project);
- Participated in Emirates Custom Car Show 2016, Art Car Project “Monster 
Camaro”, Winner of Special Award, Abu Dhabi (Certificate of Appreciation & 
Trophy Award for Unique Car Art Project);
- Participated in Gulf Car Festival 2016, Art Car Project “Monster Camaro” 
(Certificate of Appreciation & Trophy Award for Unique Car Art Project);
- Participated in Festival Organized by Ajman Police, Ajman, UAE, 2016 
(Certificate of Appreciation & Trophy Award for Unique Car Art Project);
- Participated in the YEAR OF SHEIK ZAED, National Day UAE Art Festival, 
with Zee Art Gallery, at Queen Elizabeth – 2, Dubai, 2018 (Certificate of 
Appreciation);
- Participated in Group Exhibition at “STUDIO SEVEN” Gallery, Dubai, 2018 
(Certificate of Appreciation)
- Participated in Celebrations of Women’s Day at Sharjah Arab Cultural 
Club, Exhibition in March 2019 (Certificate of Appreciation);
- Participated in Gulf Car Festival 2019, Art Car Project “Art Camaro”, 
Dubai (Certificate of Appreciation & Trophy Award for Unique Car Art 
Project);
- Participated in “Drive and Meet”, Car Show in UAQ, 2017 and 2019 
(Certificates of Appreciation);
- Participated in Exhibition at Arab Cultural Club of Sharjah, Women’s Day 
Exhibition, March 2017 (Certificate of Appreciation);
- Participated in Exhibition “JOURNEY OF SERENITY” at RETREAT Hotel Palm 
Dubai M Gallery by Sofitel. My ArtWork in the permanent Hotel Collection, 
January 2019 (Certificate of Appreciation);
- Participated in “JOURNEY OF THE EMIRATES”, Live Painting event on 1st 
December 2019 as part of 48th National Day Celebrations at Safari Mall 
Sharjah (Certificate of Appreciation);
- I have been invited as a special Guest & Judge of the Art competition in 
the Art Festival at GEMC Modern Academy in Dubai, 2019.
- Ambassador of My Country Turkmenistan at “BALANCE FOR BETTER” - “ART 
CONNECTS WOMEN”, 3rd Edition, at OO ROYAL MIRAJ Hotel, with Zee Art 
Gallery, 7-10 March 2019, Dubai. (Award Certification, Nominated in Book 
“Women Artists around the World”;
- Participated in the exhibition at Sharjah Arab Cultural Club, Women’s Day 
Exhibition, March 2019 (Certificate of Appreciation);
- Ambassador of My Country Turkmenistan at “ART CONNECTS WOMEN”, 4th 
Edition, with Zee Art Gallery at OO ROYAL MIRAJ Hotel, Dubai, 5-8 March, 
2020 (Award Certification, Nominated in Book “Women Artists around the 
World”;
- Owner of First ever Art Fitness Club - Launched with my Partner Mr. Taher 
Saifuddin our First Ever Available ART FITNESS PROJECT “GT Fitness Club” in 
Ajman, with our Unique Concepts of Fitness & Art, inspired by Favourite 
Movie “Avatar” & “Jurassic World” we achieve big goals in Health Care of 
Adults and Children in very difficult time of Pandemic, 2020-2021;
- Participated in “THE FACES”, Virtual Art Exhibition by Art4You Gallery, 
August 2020;
- Participated in “CREATED TO CREATE - I PLEDGE”, Campaign organized by 
Art4You Gallery, Breast Cancer Awareness, October 2020;
- Participated in “A LITTLE OF THIS, A LITTLE OF THAT”, an exploration into 
Mixed Media, Online and Virtual Exhibition, curated by Jesno Jeckson, 
Art4You Gallery, 20 December 2020 – 20 January 2021 (Certificate of 
Appreciation);
- Participated in “THE LEGACY OF LEADERSHIP”, Tribute to the UAE, Online 
Exhibitions with Art4You Gallery, February 2021 (Certificate of 
Appreciation);
- Participated in “DIVERSITY OF PORTRAITS”, Art exhibition, in the Artist 
playground in the Dilmah T-Lounge of the Pullman Creek Hotel – Deira City 
Centre, Dubai, March 2022 (Certificate of Appreciation);
  - Participated in WORLD ART DUBAI, Dubai World Trade Centre, March 2022 
(Certificate of Appreciation);
- Participated in Ramadan Exhibition “Orientalism & Folk Art”, Artist 
playground in the Dilmah T-Lounge of the Pullman Creek Hotel – Deira City 
Centre, Dubai, March 2022;
- International Online Show “VIOLET”, Kolkata, West Bengal, India, February 
2023;
- International Women’s Day Exhibition at Sharjah Arab Cultural Club, March 
2023;
- Participated in International Art Exhibition Organized by “First Wish Art 
Gallery” & ArtForumUAE, Winner of the “Best Artwork”, Dubai, June 2023;
- “Let’s live with less plastic”, International Virtual exhibition 
organized by Art4you Gallery, July 2023;
- Honoured to be appointed President of the Department of Turkmenistan in 
International Action Art by UNESCO Greece Art, July 2023;
- “Art Par Excellence” Art Exhibition organized by ArtForumUAE, August 
2023, Dubai;
- Participated in the International Group Exhibition “Soul of Art” at 
Adagio Hotel Dubai, organized by ArtForumUAE, September 2023;
- Participated in the International Art Exhibition in Athens, Greece, 
organized by International Action Art (IAA) by UNESCO, September 2023;
- Participated in the International Art Exhibition in “Aya” art Gallery, 
organized by World Ambassador Sultana Kazim in honour of the greetings of 
the IAA, Greece delegation in Dubai, September 2023;
- “Violet” International Art Exhibition organized by “Tobuoviman”, India, 
February 2024;
- Published in Calendar 2024 by “Tobuoviman”, India, February 2024;
- “The Beauty of UAE in Art” Art Exhibition organized by ArtForumUAE, March 
23, 2024, Hotel Mercure, Dubai;
- Published (Art Story) in Magazine “Homagi International” as Global 
Artist, Indonesia – India, 2024;
- Participated in International Art Carnival “Collage International Art”, 
Kala Academy, Delhi, India, April 2024;
- Participated in International Art Exhibition “L Art du Monde” organized 
by UNESCO, IAA, Paris, April 2024;
- Golden Member in College International Artists Club - Delhi College of 
Art, India, January 2025;
- Participated in the 30th Anniversary of the Neutrality of Independent 
Turkmenistan and the Year of 2025 is the Year of International Peace and 
Trust of Turkmenistan at the General Consulate of Turkmenistan in Abu 
Dhabi, UAE, February 2025;
- Awarded Spandan Ambassador - Has been designated as Spandan Ambassador 
for Turkmenistan and the United Arab Emirates, March 2025;
- Certificate of compilation of the “One Million Prompters” initiative, 
launched by His Highness Sheikh Hamdan bin Muhammed bin Rashid Al Maktoum, 
Crown Prince of Dubai, February 2026.
- Honorary International Ambassador of MOCA Gandhinagar (Museum of 
Contemporary Art), India, 2026
- Finalist of the selection for the international exhibition "Akhal-Teke 
Horse – the Highest Standard of Beauty" in the Kronenberg, Netherlands, 
September 2026, Organized by —
       -    European Akhal-Teke Horse Breeding Association;
The State Association «Turkmen Atlary»;
Ministry of Culture of Turkmenistan.
International Akhal-Teke Horse Breeding Association;
Pelbergen Equestrian Sports Complex in Kronenberg, Netherlands;
', 'https://drive.google.com/file/d/1lw6iUjdLRKCVesKte-5F2rO3JxmI2LD3/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1lw6iUjdLRKCVesKte-5F2rO3JxmI2LD3&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R45', 'Anood Ahmed Alali', '555159966', 'anoode.ae@gmail.com', 'Yes',
  'Whisper of the Horizon', 'Painting', 'Acrylic', '70X50', '2025',
  'Whisper of the Horizon represents one of my favorite 
times of the day: sunrise.
It represents hope, a new beginning, and the chance to start again', 'Anood A is a 24-year-old multidisciplinary artist 
whose creative journey began in 2016. In addition to visual art, she is a 
singer and pianist with a strong interest in literary, scientific, and 
educational writing in both English and Arabic. Alongside her creative 
work, she is currently studying Biomedical Engineering at Khalifa 
University in her senior year.', 'https://drive.google.com/file/d/1I8fxzy3-uKIdmO8DwVMBFbnJKlBrmRjY/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1I8fxzy3-uKIdmO8DwVMBFbnJKlBrmRjY&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R46', 'mika aly', '971528835396', 'malakaly7@hotmail.com', 'Yes',
  'WHERE CURRENTS MEET', 'Painting', 'Mixed media on canvas: modeling paste, acrylic paint, 
and metallic accents', '140x140', '2026',
  'An exploration of movement through layered textures and 
flowing shades of blue, where each mark creates its own rhythm within the 
canvas.', ' I’m Malak Aly, an Egyptian artist based in the UAE. 
I create mixed-media artworks that explore texture, movement and colour. My 
work is intuitive and expressive, using layered materials and bold colour 
combinations to turn feelings and inspiration into something you can 
physically see and feel.', 'https://drive.google.com/file/d/1s57Mr61lxsTmI6kImO7qdPLJecOeOdII/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1s57Mr61lxsTmI6kImO7qdPLJecOeOdII&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R47', 'Sharon mendez', '547816186', 'sharonmendez1111@gmail.com', 'Yes',
  '“Unbound Vigor”', 'Painting', 'Acrylic on canvas', '90-120 cm', '2024',
  'Her broken wings cannot break her spirit. She rises above 
judgment, embraces her freedom, and chooses to soar.', ' I am is a self-taught abstract artist based in 
Dubai, creating expressive works through acrylic, mixed media, texture, and 
bold visual forms. My art explores emotion, resilience, spirituality, 
identity, and the human experience, transforming ideas and personal 
reflections into meaningful visual narratives. With a passion for original 
paintings, bespoke artwork and  murals  My work is guided by the belief 
that art should not only be seen, but felt. Through colour, symbolism, and 
texture, I create pieces that invite connection, reflection, and 
imagination.', 'https://drive.google.com/file/d/1x7ORvdgbmHx08wBRL6UK2gD_G_NBlNuJ/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1x7ORvdgbmHx08wBRL6UK2gD_G_NBlNuJ&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R48', 'Suad Issa Salim Ali', '971569579396', 'suadissa99@gamil.com', 'Yes',
  'Heirs of Visions', 'Painting', 'Oil on canvas', '60 x60 cm', '2025',
  'Heirs of Vision

Two faces meet within a single portrait, not as separate generations, but as one continuous story.

Heirs of Vision reflects the UAE as a place where heritage and possibility exist side by side. The divided portrait becomes a shared identity: one half carrying what has been built, the other looking toward what is still to come.

For me, the UAE is more than the place where I live and create. It is a meeting ground of cultures, ambitions, and experiences, where people arrive carrying pieces of their own stories and, in return, become part of something shared.

This painting represents that exchange between generations, between past and future, and between the country and the people who call it home.

Different stories. One ground. One continuing vision.', 'Suad Issa is a multidisciplinary artist and designer based in the UAE. Her practice explores identity, heritage, belonging, and contemporary life through portraiture, textured art, and mixed-media works. Her work often reflects the relationship between people, place, and shared experience, combining traditional techniques with a contemporary visual language. Alongside her personal art practice, she works professionally in art and design, developing hand-painted and conceptual work for luxury leather goods. Through her work, Suad aims to create visually engaging pieces that carry cultural meaning and emotional connection.', 'IMG_4997.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1hG-w6onFR9mUthqDpbsf7WybXZXhKpIs&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R49', 'Olga Sova', '971506748284', 'olga@sova-artist.com', 'Yes',
  'A Trade Lost in Translation', 'Painting', 'Watercolor and Colored Pencils on paper', '54x39cm', '2026',
  '"A Trade Lost in Translation" captures a quiet, surreal 
encounter between Bedouin merchants exchanging camel wool for pearls on an 
impossible scale. Rooted in the cultural memory of the Arab world, the 
scene evolves into a metaphor for what is gained and lost when values, 
intentions, and meanings meet but do not align. As traditions and 
expectations are placed in balance, the moment becomes suspended—reflecting 
how both individual and collective experiences are shaped by attempts at 
understanding and connection. This work explores “shared ground” not as a 
specific place, but as an emotional and symbolic space: the delicate 
tension where belonging, memory, and cultural exchange create new but 
unresolved forms of meaning. Through my “quiet surrealism” approach, I 
invite the viewer to sense the invisible weights of translation—moments 
when shared space is defined as much by what can’t be measured or fully 
understood, as by what can.', 'Olga Sova is a Dubai-based artist recognized for 
her introspective "quiet surrealism." Originally from Russia and trained in 
classical art, she creates work inspired by the intersection of collective 
tradition and personal experience. Sova’s deeply poetic pieces explore the 
boundaries of belonging and identity, blending European and Middle Eastern 
influences in watercolor and mixed media. Her art is featured in private 
collections worldwide, and she has received international recognition, 
including the Sakura Art Prize and selection for major exhibitions across 
the UAE and Europe.', 'Olga Sova_A Trade Lost in Translation_Mixed Media_54x39cm_2026 .jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=12hGQslZ9gMpQFy8sXq1XXI_C5JV-LIAj&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R50', 'Preeti Anand', '502467888', 'preetikauranand@gmail.com', 'Yes',
  'Blue pitcher and Grapes', 'Painting', 'Oil on canvas', '35x25', '2026',
  'An intimate still life exploring the quiet dialogue 
between cool blue light, warm colour, and the simple beauty of everyday 
objects.', 'Preeti Kaur Anand is a UAE-based Indian 
contemporary artist whose work explores light, colour, atmosphere, and the 
quiet connection between people and the natural world. Working primarily in 
oils, she creates contemplative paintings that move beyond representation 
to evoke mood, memory, and emotional resonance. Her work has been exhibited 
internationally and across the UAE and India.', 'IMG_3194.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1c2svOQijvp6YAfaASjmDtufrd7FoGRP7&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R51', 'Suad Issa Salim Ali', '971569579396', 'suadissa99@gamil.com', 'Yes',
  'Heirs of Visions', 'Painting', 'Oil on canvas', '60 x60 cm', '2025',
  'Heirs of Vision
Two faces meet within a single portrait, not as separate generations, but 
as one continuous story.

Heirs of Vision reflects the UAE as a place where heritage and possibility 
exist side by side. The divided portrait becomes a shared identity: one 
half carrying what has been built, the other looking toward what is still 
to come.

For me, the UAE is more than the place where I live and create. It is a 
meeting ground of cultures, ambitions, and experiences, where people arrive 
carrying pieces of their own stories and, in return, become part of 
something shared.

This painting represents that exchange between generations, between past 
and future, and between the country and the people who call it home.

Different stories. One ground. One continuing vision.', 'Suad Issa is a multidisciplinary artist and 
designer based in the UAE. Her practice explores identity, heritage, 
belonging, and contemporary life through portraiture, textured art, and 
mixed-media works. Her work often reflects the relationship between people, 
place, and shared experience, combining traditional techniques with a 
contemporary visual language. Alongside her personal art practice, she 
works professionally in art and design, developing hand-painted and 
conceptual work for luxury leather goods. Through her work, Suad aims to 
create visually engaging pieces that carry cultural meaning and emotional 
connection.', 'IMG_4997.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1hG-w6onFR9mUthqDpbsf7WybXZXhKpIs&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R52', 'CAROLINA GALVAO', '971 588056398', 'carolina.s.galvao@gmail.com', 'Yes',
  'Veredas', 'Installation', 'Ceramic installation / Black Stoneware', 'V1: 63 × 7 cm / V2: 63 × 7 cm / V3: 55 × 6 cm / V4: 52.5 × 8 cm', '2021',
  'VEREDAS is a series of sculptural ceramic vessels 
inspired by the arid landscape of the desert (sertão) in Northeastern 
Brazil. The elongated forms and dark silhouettes reflect a landscape shaped 
by dryness, resilience and time.
Living in the UAE has brought a new perspective to the work. Although 
geographically distant, the desert here and the sertão share conditions of 
aridity, adaptation and endurance. VEREDAS brings these two landscapes into 
dialogue, exploring how different territories can share similar experiences 
of transformation and permanence.
Presented as a group of four vessels, the forms stand together like 
silhouettes in a landscape, creating a quiet connection between place, 
memory and belonging.', 'Carolina Galvão is a Brazilian ceramic artist from 
Northeastern Brazil, currently based in Dubai, UAE. Her practice explores 
memory, landscape, transformation and belonging through hand-built 
sculptural forms. Working with clay, wild clay and experimental firing 
processes, she creates pieces that reflect the relationship between 
material, place and time.', 'VEREDAS_Carolina_Galvao_Artwork_8_photos.pdf', TRUE, '',
  'file', 'https://drive.google.com/file/d/1qO5W7nc3jbCyglQaAbKiMvvYvT2DQHRn/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R53', 'Sophiya Khwaja', '971501155539', 'sophiya.khwaja@gmail.com', 'Yes',
  'What Lies Behind, Beneath, Beyond', 'Painting', 'Acrylic and graphite on paper', '64 x 51 cm', '2026',
  'The work reflects on the idea of home as something 
continually being built, rather, painted. Living in the UAE, I think of 
belonging not as a fixed state but an accumulation of memories, influences 
and experiences carried between people and places. The piece  imagines the 
individual as a vessel situated in a shifting landscape both formed and 
transformed by encounters around us.

Fragments of the figure merge, overlap and move through one another, 
suggesting how identities and experiences are never entirely separate. The 
UAE becomes “Shared Ground”, where different histories, cultures and 
perspectives meet, leaving traces on one another. The work considers this 
exchange reciprocal; what we bring to places, what they give back, and how 
these exchanges create something larger than the individual. Each encounter 
opens a small gap into something beyond ourselves: what lies behind us, 
around us and just beyond our view continually shapes who we become.
Short Artist Biography: Sophiya Khwaja is a Fulbright Fellow with an MFA 
from the Rhode Island School of Design (2007) and BFA from
the National College of Arts Lahore (2003).', 'Sophiya is a MacDowell Fellow (2026) and a recipient of the Abu Dhabi 
Cultural Foundation Artist Mentorship
Programme (2024), Tashkeel’s Critical Practice Programme (2023) and Campus 
Art Dubai (2013/14). She has been an artist in residence at Art Jameel Open 
Studio (2017/18), Vermont Studio Center (2016), and Santa Fe Art Institute, 
USA (2013). She has also been selected by UNESCO as an artist 
representative for art programming in Ajman, UAE and Andorra.

Sophiya has had solo exhibitions at Tashkeel, Dubai, Cade Tompkins Projects 
RI, USA, The North Dakota Museum of Art USA and Nomad Gallery Islamabad. 
She lives and works in Dubai, UAE.', 'Sophiya_Khwaja Image.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=12MyAsAbetW3vlhK1z4SJrOExzT5Pjm3i&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R54', 'Tom Alt', '971505873211', 'Toomasaltnurme@gmail.com', 'Yes',
  'desert flower', 'Sculpture', 'metal welding', '3 x2x2 m', '2025',
  'In Desert Flower, Toomas Altnurme explores the tension 
between fragility and endurance through welded metal. Inspired by the forms 
of desert plants, the sculpture transforms an industrial material—hard, 
heavy, and resistant—into an organic, flower-like structure.', 'Toomas Altnurme
Toomas Altnurme is an Estonian-born contemporary artist whose practice 
explores the relationship between nature, humanity, and the environment. 
Working across sculpture, painting, and installation, he combines 
traditional craftsmanship with contemporary artistic approaches.
His sculptures often transform industrial materials, particularly metal, 
into organic and expressive forms inspired by nature. Through welding, 
construction, and experimentation with materials, Altnurme investigates 
themes of transformation, resilience, movement, and the connection between 
natural and human-made worlds.
His work reflects a continuing interest in the dialogue between material, 
space, and the forces of nature.', 'IMG_3985.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=142od27ofK-z5p-cwQ5rOQsJZMTw0jKKe&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R55', 'COOLBYRON', '16195307966', 'coolbyrondesigner@yahoo.com', 'No',
  ' chCOOLBYRON NEW CITY 2 AD-25-753A2-DIGITAL-78X57-2025', 'Painting', 'DIGITAL LATEX', '78x57 inches', '2025',
  'THE CONCEPT: is developed from ART AND TECHNOLOGY OF 
DESIGN. The idea is developed from a sophisticated Concept of Intrinsic 
Value of Space. It combines the visual and emotional relationship in a 
Color Strategy. It integrates the spatial aspects to promote depth, 
perspective and proporitionalism and to explore the nature of Color and 
abstracted impressionism in Contemporary Art. I investigate ideas related 
to Man’s Impact on Nature.
THE ARTWORKS: artist created new style of TECHNO-EXPRESSIONISM incorporates 
both hand and digital technologies. The composition is an image that 
integrates COLOR FIELDS from Abstract Expressionism and STRUCTURED FORMS 
from Hard Edge Abstraction. The artworks are integrated paintings using 
latex mediums, encausto, pigments, acrylics on canvas or prints. My focus 
is the COLOR ADVANCEMENT to create new art image and form.', 'THE ARTIST: COOLBYRON my art name BYRON KEENER 
international VISUAL ARTIST with over 40 years of experience in ART and 
DESIGN with several academic degrees and professional experience as an 
artist, designer and architect. The artworks range from abstracted 
integrated paintings, landscapes, mixed media integrations, mural 
developments, to environmental Marco Art. He is an Abstract Art Master with 
over 300 finalist and awards. He is a contemporary COLORIST. COLORIST means 
impressionsim. san diego california', 'chCOOLBYRON NEW CITY 2 AD-25-753A2-DIGITAL-78X57-2025.jpg', FALSE, 'Not resident',
  'image', 'https://drive.google.com/thumbnail?id=1zVywgVPimf-nGKeFjcZwwT3u7TUEL-1m&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R56', 'Hazem Hasan', '589015228', 'hazmhas18@gmail.com', 'Yes',
  'Woman world', 'Painting', 'Acrylic on Canvas', '60x90 cm', '2026',
  'The artwork reflects a sense of human affection that goes 
beyond the direct expression of love. The face merges with Arabic letters 
into a unified composition, suggesting that affection is part of human 
identity and inner memory. The work balances emotion, contemplation, and 
Arab identity.', 'Visual artist, calligrapher, and creative designer 
with a background in Fine Arts. His practice brings together contemporary 
art, Arabic calligraphy, and visual design, exploring human emotion, 
identity, and modern expressions of Arab culture.', 'inbound7443062582142716837.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1fWJa-1J7RX7dhpBlXbqlM3yyJlbg9MaR&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R57', 'Jessica von rondon', '971503995815', 'contact@vonrondonart.com', 'Yes',
  'Between Silence', 'Painting', 'Acrylic on canvas', '80x105', '2025',
  'Between Silence explores the quiet space between what we 
feel and what we are able to express. The central figure appears suspended 
between strength and vulnerability, surrounded by fragmented architectural 
forms that suggest both shelter and confinement.

Through geometric shapes, muted earth tones, deep shadows and warm light, I 
wanted to portray an inner world that remains largely unseen. The glowing 
light represents hope and the emotions we continue to carry even during 
moments of isolation and uncertainty.

This work reflects the idea that silence is not emptiness. Sometimes, it 
holds our deepest thoughts, memories and emotions—the parts of ourselves 
that exist beyond words.', 'Jessica Von Rondon is a Brazilian contemporary 
artist based in Dubai, UAE. Her work blends contemporary cubism, geometric 
abstraction and expressive texture, often exploring themes of identity, 
emotion and personal transformation. Working primarily with acrylics and 
mixed media, she builds her paintings through layers of colour, texture and 
occasional gold-leaf details. Her distinctive visual language combines bold 
geometric forms with emotionally expressive subjects, creating artworks 
designed to invite connection and reflection.', 'IMG_4704.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=13b4LsMuehRP_Jhb9L7oMV0Es4D-qwpZf&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R58', 'Dalia Rafeh', '971503486690', 'Daliarafeh100@gmail.com', 'Yes',
  'ص', 'Installation', 'Neon light', '80 x 60', '2026',
  'Three lines trace the Arabic letter ص, layered in light.
The work begins with three words: صبر، صلاة، صمود — patience, prayer, 
steadfastness.
Repeated like a mantra, they become three pillars — inner forces that 
sustain us through uncertainty and change.
Rendered in light, the repeated lines follow the same path, yet remain 
distinct, suggesting how different values, histories, and experiences can 
coexist within a shared space.
Rooted in Arabic language, the work reflects on the words we carry with us 
— words that hold us together, ground us, and give us the strength to 
endure.', 'Dalia Rafeh is a Lebanese multidisciplinary artist 
and visual communicator whose practice moves between art, language, and 
spatial thinking.

Working across painting, drawing, text, neon, and installation, she 
explores memory, identity, belonging, and collective experience. Arabic 
language often enters her work as both material and metaphor — sometimes 
poetic, sometimes playful, sometimes political.

Her visual practice is intuitive, meditative, playful, and experimental, 
with recurring forms including creatures, botanical shapes, symbols, eyes, 
words, and fragments of language. Her work moves between the personal and 
the collective, often responding to the social and political realities that 
surround her.

With a background in interior design and fine arts, Rafeh approaches ideas 
spatially, imagining work not only on paper or canvas, but on walls, 
buildings, objects, and within public space. Light, language, repetition, 
and scale have become increasingly central to her practice.', 'Dalia Rafeh -OMIC Shared Ground .pdf', TRUE, '',
  'file', 'https://drive.google.com/file/d/1-CeaTTzlbjHoh-1hmSkUC0CjCELnFIBC/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R59', 'Mohammad Naved Ghani Hashmi', '971502252682', 'nghashmi@gmail.com', 'Yes',
  'Bol', 'Painting', 'Colour Pencil', '76cm x 90cm', '2025',
  'Behind the burqa lies a voice unseen yet alive. Bol 
explores silence, identity and the quiet courage to speak when the world 
expects you not to.', ' I am a self taught artist from Pakistan exploring 
the human emotions thorugh variety of mediums (oil charcoal and colour 
pencil). I specialize in hyper realism and gain inspiration from South 
Aisan music and literature.', 'inbound6367310812061215946.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1yuhy9FrveWbLq7bErMkIskfv2rT1DaKG&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R60', 'Hamed Yehia', '971585511247', 'hamedyehia1@gmail.com', 'Yes',
  'Ascending', 'Painting', 'Acrylic on canvas', '70x100', '2026',
  'Ascending is a study of rise under pressure. A field of 
blazing red holds a pale, shifting structure, part altar, part horizon, 
where thin, dark figures stretch upward like burned matchsticks or distant 
towers. They feel small against the heat, yet unmistakably persistent. The 
work captures that moment when elevation isn’t triumph, but necessity, 
climbing through noise, grief, and intensity toward a quieter level of 
breath. Here, ascent is not escape, it’s endurance made visible.', 'The name is Hamed Yehia, an amateur painter and a 
full time TV director, my main passion is telling stories regardless of the 
medium', 'IMG_6802 (1).jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1gWkinWhNUUa-tVeyoYIlOfll3ERxc6Ub&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R61', 'sofia fadi', '509199107', 'sofiafadi1234@gmail.com', 'Yes',
  'before becoming', 'Painting', 'oil on wood', '121.92 cm W × 152.4 cm H.', '2026',
  'Before Becoming explores the uncertain space between who 
we were and who we are becoming. A girl is held by a skeletal figure, 
creating a contrast between innocence, vulnerability and the permanence of 
what we carry with us. The skeleton represents the parts of ourselves that 
remain beneath change — memories, experiences, fears and past versions of 
ourselves. In contrast, the girl represents growth, identity and the 
uncertainty of becoming.

The intense blue and red lighting creates a dreamlike atmosphere, placing 
the figures somewhere between reality and memory. The opposing colours 
reflect the emotional tension of growing up: comfort and fear, familiarity 
and change, attachment and release.

Through this work, I explore the feeling of outgrowing parts of yourself 
while still carrying them forward. Before Becoming captures the quiet 
moment before transformation — when the past still has a hold on you, but 
the future is beginning to emerge.', ' Sofia Abou Shioun is a UAE-based multidisciplinary 
artist whose work is driven by curiosity, experimentation, and 
storytelling. Moving between painting, mixed media, and graphic design, she 
explores identity, culture, memory, and the constantly changing world 
around her. Sofia enjoys working across different styles and materials, 
allowing each piece to develop its own visual language. Her work often 
combines vibrant colour, layered imagery, and cultural references to create 
contemporary interpretations of the places, people, and experiences that 
shape her.', '_MG_0314.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1iPKc_37imBj4QWyd6dzGMEuHRdNYNt5C&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R62', 'Alia Amin', '971567687686', 'aliaamin79@gmail.com', 'Yes',
  'Crimson silence', 'Painting', 'Acrylics on canvas', '100x100', '2026',
  'I am Alia Amin, a visual artist inspired by the beauty, 
emotion, and quiet stories found in the world around us. Through my 
paintings, I seek to transform moments, landscapes, nature, and imagination 
into works that invite the viewer to pause, feel, and connect.

Working primarily with acrylics and oil, I am drawn to expressive colour, 
atmosphere, light, and detail. My work often explores the relationship 
between nature and emotion—from peaceful landscapes and lush oases to 
compositions that create a sense of warmth, serenity, and escape. Rather 
than simply reproducing what I see, I aim to capture the feeling of a place 
or moment.', ' My name is Alia Amin Abdulkarim. I was born and 
raised in Dubai, originally from Pakistan. Since childhood, I always had a 
passion for colours and would draw and paint anything that pleased my 
eyes.  I have been painting since the age of 6.

I am a talented, imaginative, passionate and hardworking emerging artist 
who''s got interest in creating original pieces. I work with oil, acrylics 
and mixed media on canvas preferably large sizes.


I started off with water colours but wanted to learn the art of using oil 
paints and oil pastels. So I took formal training at Dubai International 
Art Centre Jumairah and Lotus Institute in Dubai knowledge Village

I derive  inspiration from photographs taken and  collected over the years 
on trips around the world. Off late I''m moving towards Calligraphy and 
abstract art but my forte remains nature, landscapes and cityscapes.

I paint because it gives me peace of mind and it’s a therapy for me and 
makes me look at the world differently. I end up appreciating everything 
around me. It’s a  passion I have grown up and it gives me an optimistic 
look towards life.', 'IMG_1643.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1aL4MIEPhYZJ5uLO-mECYaVUovpVMdlcL&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R63', 'Nevine Meguid', '971564918177', 'hello@nevinemeguid.com', 'Yes',
  'Haa - Shared Ground', 'Sculpture', 'Alcohol ink on Acrylic and Aluminium', 'W 55cm x H 105cm x D 10cm', '2026',
  'Haa, an Arabic letter created through breath. It is a 
sound that needs air to exist, a quiet release that connects what is inside 
us with the world around us.

In this work, Haa represents the UAE as a shared home, shaped by the 
people, cultures and experiences that come together here. Each fragmented 
element represents a different story, identity or perspective. Together, 
these fragments create one evolving form, while the spaces between them 
leave room for difference, connection and dialogue.

The transparency of the sculpture allows light to pass through it while 
casting shadows onto its surroundings. In this exchange, the work both 
receives from its environment and leaves something behind.

The UAE doesn’t simply contain different people. The relationship is 
reciprocal. We shape the place we call home, and the place shapes us in 
return.

Like breath, belonging is not something we simply possess. It moves between 
us.', 'Nevine Meguid, an avant-garde Emirati artist with 
Australian & Egyptian roots, approaches her work from a multi-disciplinary 
perspective.

Beginning her career as a graphic designer before transitioning into the 
art world, Nevine has garnered distinction for her innovative approach, 
culminating in a successful six-month Artist-in-Residence program at 
Manarat Al Saadiyat, Abu Dhabi, 2023.

Her artistic process explores diverse mediums, including fluid inks, to 
create dynamic, textured layers. Nevine’s fascination with Arabic 
calligraphy is evident in her abstract sculptures and paintings, where she 
reinterprets the form and shape of individual Arabic letters. Working with 
transparent acrylic and light, she creates pieces that evolve as light 
interacts with their surfaces. Her distinctive style is seamlessly 
integrated into multi-layered works that include abstract paintings, 
installations and sculptures.

Each of her pieces is one-of-a-kind and produced in limited editions.

Nevine has exhibited her work globally, with pieces showcased in 
prestigious locations such as Khawla Art Gallery, Van de Goudenburg Art 
Gallery, Atlantis The Royal Hotel, Dubai, Sofitel Hotel, Dubai, Manarat Al 
Saadiyat, Abu Dhab and the Islamic Museum of Australia, Melbourne.', 'IMG_8371.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1RFNqt8ar_cBVCDndt7QPaSIAkkcfABSv&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R64', 'Khalid Almoayed', '971542052002', 'almoayed.k@gmail.com', 'Yes',
  'Beyond the Apollonian', 'Painting', 'Acrylic on Canvas', '120 x 120cm', '2026',
  'A self-portrait at the threshold between structure and 
instinct, asking what we risk by changing, and what we lose by staying 
still.', 'Khalid Almoayed is a Bahraini artist whose practice 
is shaped by the tension between highly structured corporate environments 
and a persistent attraction to instinct, imagination and the irrational. 
With a background in Philosophy, Politics and Economics and a career spent 
inside complex organisations and systems of decision-making, he is deeply 
familiar with worlds built around order, performance, control and 
expectation.

His paintings translate that experience into surreal, dreamlike spaces 
populated by hybrid figures, distorted landscapes and heightened colour. 
Surrealism becomes a way of disrupting the logic of everyday life, allowing 
psychological tensions, longing and uncertainty to take physical form.

Almoayed’s work often places figures at thresholds between rigid and 
organic worlds, exploring what happens when systems that provide stability 
also begin to constrain experience. Rather than rejecting structure 
outright, he is interested in the uneasy space between discipline and 
instinct, asking whether freedom lies in escape, transformation, or in 
learning to move between different realities without losing oneself.', 'IMG_6948.jpeg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1k063n9cDrTQlYZMnOsOKIGg_RePRN8Tj&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R65', 'Ozoda Shadieva', '971527260196', 'o.shadieva@yahoo.com', 'Yes',
  'Fisherman’s dream', 'Painting', 'Mixed media: acrylic, oil pastels, crayons, fabric', '100cm / 150cm', '2026',
  'A whimsical underwater world where real and imagined 
creatures drift together. Fisherman’s Dream captures the beauty, variety, 
and quiet mystery of life beneath the surface — somewhere between a 
naturalist’s study and a dream.', 'Born and raised in Uzbekistan, worked with 
different artists in their studios. Now based in Dubai, I create my own 
artworks and established my own jewelry brand. I love experimenting with 
different techniques and colors.', 'image.jpg', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1F8XkGXBcS7XKjqvHTeuv2Ysua1X343j4&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R66', 'Sireen Bahram Abdulrasul Chaaker Alraeesi', '971543890998', 'sireenbc@gmail.com', 'Yes',
  'Vestiges de l’Or rouge', 'Painting', 'Acrylic on canvas', '20x28inch', '2026',
  'Vestiges de l’Or Rouge
Inspired by my journey through Tanzania, this piece captures the fiery red earth, glowing sunsets, and warmth that lingered in my memory.
Red became the soul of the painting bold, magnetic, and almost consuming while fragments of blue, black, and gold emerge like fleeting memories. The gold introduces a sense of richness and quiet luxury, echoing the sunlight that transformed the landscape before me.
Rather than recreating Tanzania, Vestiges de l’Or Rouge captures the traces it left behind a landscape transformed into colour, emotion, and memory.', 'My name is Sireen, and I am an emerging emerati contemporary abstarct artist working under the name SIRENE, based in the UAE. My practice explores emotion, memory, luxury, and atmosphere through contemporary abstract painting.

My works often begin as imagined visions. I first sketch and develop the composition digitally, giving each piece its own name and story before translating the vision onto canvas through layered textures, expressive movement, and carefully considered colour.

I am drawn to creating works that feel both emotionally immersive and refined, inviting the viewer to discover their own interpretation within each layer. My aim is to create paintings that remain timeless while carrying a sense of emotion, abundance, and quiet longing.', 'https://drive.google.com/file/d/1CTeQ1zaTSLZPZJ3sOUkopnBNMwCFJh0U/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1CTeQ1zaTSLZPZJ3sOUkopnBNMwCFJh0U&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R67', 'Jana Fares', '971503370490', 'janaaafaress@gmail.com', 'Yes',
  'Between Tides & Lines', 'Painting', 'Acrylic on canvas', '70 x 100', '2026',
  'This Piece explores the idea of possibility, resilience and the pursuit of success. The sea represents and open realm of endless opportunities, where there are no boundaries to how far one can go. In contrast, the tennis course represents discipline, resilience, and the determination to keep moving forward despite challenges. I intentionally used the same shades of blue across the ocean and the court to connect these two ideas, suggesting that opportunity alone is not enough—it is through dedication, effort and perseverance that we are able to achieve our goals. The players represent the continuous journey of competing, striving, and pushing beyond limitations, reflecting the belief that with enough determination, we can overcome any obstacles and achieve what we set our minds to.', 'I am an 18 year old artist who has loved art from a young age. Art has always been a way for me to express my ideas and emotions beyond what words can communicate.. Over the years, I have explored different styles, techniques and mediums, allowing my work to constantly evolve. I believe that every piece of art has a meaning beyond what initially meets the eye. I use symbolism, color, and imagery to create layers of meaning and invite the viewer to look beyond the surface. I aim to create work that does more than capture attention, i want each piece to leave an impression, and allow every viewer to discover a meaning of their own. Through my art I transform personal ideas into visual stories that encourage people to pause, look closer, and connect with something beyond the image itself.', 'https://drive.google.com/file/d/1oAyM2SsKi_dOvWs-j4C1xpobyABW4AHf/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1oAyM2SsKi_dOvWs-j4C1xpobyABW4AHf&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R68', 'Jana Fares', '971503370490', 'janaaafaress@gmail.com', 'Yes',
  'Sewn Into Standards', 'Installation', 'Thread on canvas', '91.5 cm x 69.5 cm', '2026',
  'This artwork is a self portrait photograph combined with hand embroidery, exploring the struggles and complexities of being a teenage girl. The stitched elements symbolize the expectations and pressures placed on young women by society, family, and the world around them. Each threat represents another expectation, judgement, or standard that gradually becomes intertwined with our identity. The vibrant colors contrast with the portrait, representing the mask we creat to appear confident, happy, and composed while hiding the emotions we may be experiencing underneath. The embroidery also suggests how these pressures can feel permanent, as tho they have been sewn into who we are. Through this piece, I explore the internal conflict between authenticity and conformity, questioning how much of ourselves we change to meet the expectations of others.', 'I am an 18 year old artist who has loved art from a young age. Art has always been a way for me to express my thoughts, ideas, and emotions beyond what words can communicate. Over the years, I have explored different styles, techniques and mediums, allowing y work to constantly evolve. I believe that every piece of art I create carries a meaning beyond why initially meets the eye. I use symbolism,  color and imagery to create layers of meaning and invite the viewer to look beyond the surface. I aim to create work that does more than capture attention. I want each piece to leave an impression, provoke thought, and allow every viewer to discover a meaning of their own. Through my art, I transform personal ideas into visual stories that encourage people to pause, look closer, and connect with something beyond the image itself.', 'https://drive.google.com/file/d/1-FFGGwLFRPwNNewGtYotKqzNET_WhnV2/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1-FFGGwLFRPwNNewGtYotKqzNET_WhnV2&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R69', 'Jana Fares', '503370490', 'janaaafaress@gmail.com', 'Yes',
  'CTRL + Z', 'Painting', 'Media Collage', '(60 x 45) x3', '2026',
  'This collection explores the contrast between external appearances and the internal struggles that exist beneath them. The black and white portraits of Kate Moss and Fairuz represent how women are often reduced to an image, Identity or expectation created by society. Surrounding them, the chaotic layers of magazine cutouts, typography, symbols, colors and imagery represent the overwhelming noise of societal pressure, consumer culture, identity, and self expression. I deliberately created an imperfect and fragmented composition to reflect how identity is constantly shaped, challenged and reconstructed. The contrast between the controlled grayscale portraits and the collages suggest the difference between how we are perceived and what we experience internally. Both figures became symbols of individuality within their own cultural contexts, and their presence allows the work to question what it means to exist authentically while being constantly observed and defined by others.', 'I am an 18 year old artist who has loved art from a young age. Art has always been a way for me to express my thoughts, ideas, and emotions beyond what words can communicate. Over the years, I have explored different styles, techniques, and mediums, allowing my work to constantly evolve. I believe that every piece of art I create carries a meaning beyond what initially meets the eye. I use symbolism, color, and imagery to create layers of meaning and invite the viewer to look beyond the surface. I aim to create work that does more than capture attention, I want each piece to leave an impression, provoke thought, and allow every viewer to discover a meaning of their own. Through my art, I transform personal ideas into visual stories that encourage people to pause, look closer, and connect with something beyond the image itself.', 'https://drive.google.com/file/d/1T_4wUi9VDieNLFRtGvFzbMhNfxjLuYqo/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1T_4wUi9VDieNLFRtGvFzbMhNfxjLuYqo&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R70', 'Arshi Kamal', '971568874769', 'arshikamal.05@gmail.com', 'Yes',
  'The Koi Koi', 'Painting', 'Acrylic on Canvas', '25 x 30cm', '2026',
  'An intimate acrylic exploration of movement and harmony. The vibrant orange and red koi represent perseverance and transformation, circling each other in a balanced, yin-yang-like dance. Set against a backdrop of serene lotus flowers and vibrant blue water, the painting captures the delicate balance between two individuals growing together while honoring their own unique paths. It is a visual representation of connection, resilience, and the beauty of finding calm in the deep.', 'Arshi is an emerging artist residing in Dubai. With a deep appreciation for visual storytelling, her work focuses on themes of connection, spiritual growth, and the interplay between stillness and movement. Drawing inspiration from nature and the complexities of human relationships, she creates vibrant, textured acrylic pieces that invite the viewer to pause, reflect, and find meaning in the details. Her practice is rooted in a desire to leave a lasting, beautiful mark on the world.', 'https://drive.google.com/file/d/1Ps8PRXPJVpuG0jXTtWY3ZJg3jT5WxgWn/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1Ps8PRXPJVpuG0jXTtWY3ZJg3jT5WxgWn&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R71', 'Jana Fares', '971503370490', 'janaaafaress@gmail.com', 'Yes',
  'The Growth Within', 'Painting', 'Acrylic and Charcoal on card', '85 x 60 cm', '2026',
  'This piece explores how parents evolve with each generation, adapting their perspectives while remaining connected to the values they were raised with. The greyscale portrait represents tradition, stability, and the familiar identity we associate with our parents. In contrast, the vibrant blue hat represents the continuous evolution of the mind- their ability to learn, adapt, and remain open to new ideas. I chose to hide the face beneath the hat to suggest that this transformation is not always visible from the outside. Although parents may appear unchanged, their experiences and relationships with each generation can reshape the way they think and understand the world. The contrast between the traditional grayscale figure and the blue patterns reflects the balance between preserving one’s roots and embracing change. The piece represents growth as something that happens internally, showing that evolving doesn’t mean abandoning the past, but carrying it forward while becoming something new.', 'I am an 18-year-old artist who has loved art from a young age. Art has always been a way for me to express my thoughts, ideas, and emotions beyond what words can communicate. Over the years, I have explored different styles, techniques, and mediums, allowing my work to constantly evolve. I believe that every piece of art I create carries a meaning beyond what initially meets the eye. I use symbolism, colour, composition, and imagery to create layers of meaning and invite the viewer to look beyond the surface. I aim to create work that does more than capture attention; I want each piece to leave an impression, provoke thought, and allow every viewer to discover a meaning of their own. Through my art, I transform personal ideas into visual stories that encourage people to pause, look closer, and connect with something beyond the image itself.', 'https://drive.google.com/file/d/1EzoADNo0y9Um9jNEVcAcXVJ7AZnheai5/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1EzoADNo0y9Um9jNEVcAcXVJ7AZnheai5&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R72', 'Khaliundar Zolboot', '971544084170', 'khaliundarz@gmail.com', 'Yes',
  'Nomad soul', 'Painting', 'Acrylic on canvas', '60x90', '2026',
  'Beneath the eternal blue sky, this painting captures the quiet, unbroken bond between the Mongolian spirit and the land. Nestled between rolling green peaks and a winding river, the two gers stand as a symbol of home, warmth, and ancestral roots. With smoke rising into the air, a double rainbow bridging the mountains, and an eagle soaring overhead, the scene invokes a deep sense of nostalgia—a gentle reminder of the nomadic rhythm, the sacred landscape, and the timeless peace that lives in the heart of every Mongol.', 'I am a Mongolian painter based internationally, creating artwork rooted in cultural identity, memory, and the natural world. Inspired by the open landscapes, mountain valleys, and timeless nomadic heritage of my childhood in Mongolia, my paintings evoke a deep sense of peace, warmth, and connection to nature. Through atmospheric compositions and vivid imagery—from traditional gers beneath double rainbows to quiet sanctuaries of nature—I strive to capture the gentle beauty of home and share the spirit of the steppe with audiences worldwide.', 'https://drive.google.com/file/d/15_tv8xQVkrXMRxjyn0fPfulj8DX4TMD_/view?usp=drivesdk', TRUE, '',
  'file', 'https://drive.google.com/file/d/15_tv8xQVkrXMRxjyn0fPfulj8DX4TMD_/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R73', 'Swapnali Amit Mhatre', '971552399686', 'palettebyli@gmail.com', 'Yes',
  'Lense to Canvas', 'Painting', 'Oil painting', '40 x 60 cm', '2026',
  'Lense to canvas, is expressing the beauty of existence where two creators , nature and human being created a scenic experience that lasts long in the heart of every visitor. This monument is a zen temple in Kyoto, Japan named as Kinkaku Ji also known as Golden Pavilion. The original photograph was captured by me during my visit to Japan in March 2025.', 'Hi
Genuine nature lover and practicing sustainability in real life, thats what defines me. Myself Swapnali. I am an artist who try to express love towards nature through paintings. I am an architect and urban planner by professional background and painting is an activity that I do for my soul to express and cherish my feelings.
Thank you.', 'https://drive.google.com/file/d/1lYoErw7NI3VzsllSoDn-msJp5eADMoJT/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1lYoErw7NI3VzsllSoDn-msJp5eADMoJT&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R74', 'Swapnali Amit Mhatre', '971552399686', 'palettebyli@gmail.com', 'Yes',
  'Lense to Canvas', 'Painting', 'Oil painting', '40 x 60 cm', '2026',
  'Lense to canvas, is expressing the beauty of existence where two creators , nature and human being created a scenic experience that lasts long in the heart of every visitor. This monument is a zen temple in Kyoto, Japan named as Kinkaku Ji also known as Golden Pavilion. The original photograph was captured by me during my visit to Japan in March 2025.', 'Hi
Genuine nature lover and practicing sustainability in real life, thats what defines me. Myself Swapnali. I am an artist who try to express love towards nature through paintings. I am an architect and urban planner by professional background and painting is an activity that I do for my soul to express and cherish my feelings.
Thank you.', 'https://drive.google.com/file/d/1ay9P4C1Qopf3-ZlekPWxKy4tYMfdH1At/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1ay9P4C1Qopf3-ZlekPWxKy4tYMfdH1At&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R75', 'Sara Noueihed', '50 977 5398', 'sarah.nuaihedd@gmail.com', 'Yes',
  'All IN', 'Painting', 'Charcoal / pan pastel', '120cm -80 cm', '2026',
  'ALL IN — 2026

Three monkeys, one game. One rolls the dice, one holds the cards, one guards the fortune.

Rendered in black and white with color only on the objects of chance, ALL IN reinterprets the Three Wise Monkeys — they now see everything, risk everything, and reveal our own relationship to luck, greed and bluff.', 'Sara Noueihed is a Lebanese contemporary artist and founder working primarily in charcoal and gold leaf on canvas.
Her work explores resilience, spirituality, and cultural identity through symbolic motifs — Arabic calligraphy, horses, and the human figure. Balancing strength and delicacy, her signature style merges monochrome figures with radiant gold script, reflecting both the weight of history and the lightness of hope.
Her vision is to carry Beirut''s artistic spirit beyond borders, bridging tradition and modernity.', 'https://drive.google.com/file/d/1egEMvbRp6Ro2xCs_YcdqlSqSSR9XgwTm/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1egEMvbRp6Ro2xCs_YcdqlSqSSR9XgwTm&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R76', 'Naved Hashmi', '971502252682', 'nghashmi@gmail.com', 'Yes',
  'BLOODS BEEN SPAT IN JEST', 'Painting', 'Charcoal and Oil paint', '122cm x 152cm', '2026',
  'Inspired by Jaun Elia’s haunting couplet, “Meray kamray ka kya bayaan ke yahaan, khoon thooka gaya hai shararat mein,” this painting explores the unsettling space where suffering becomes so familiar that it is spoken of almost playfully.

Jaun equates something as painful and visceral as spitting blood with shararat, a mischievous jest. In that contradiction lies the tragedy: pain stripped of its drama, made casual, almost ordinary.

The room becomes a silent witness to wounds endured privately, to suffering that no longer demands sympathy or explanation. What should shock us is dismissed with a shrug, perhaps even a smile.

The work reflects that strange human instinct to conceal our deepest wounds beneath humour, irreverence and indifference. Sometimes pain stays with us for so long that we stop naming it as pain. We learn to live beside it, laugh at it, and quietly continue bleeding.', 'Naved Hashmi is a self-taught visual artist whose practice explores identity, memory, pain and the complexities of the human condition. Working primarily in oils and charcoal, his figurative works combine realism with symbolism, often drawing upon South Asian culture, Urdu poetry and personal narratives. His work has been exhibited in Singapore and the UAE, including at World Art Dubai. Through portraiture and emotionally charged imagery, Hashmi seeks to give visual form to experiences that are often difficult to articulate in words.', 'https://drive.google.com/file/d/1eQSyWp6os3jb3bCZrc_1t03j8kvr-oNt/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1eQSyWp6os3jb3bCZrc_1t03j8kvr-oNt&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R77', 'Amna Aijaz', '971568237720', 'amna.rauf@live.com', 'Yes',
  '“Layers of expression”', 'Painting', 'Texture paint  and acrylics', '60 by 60 cm', '2026',
  'As an artist I try to make paintings that speak to me and to others.I use different techniques. Different mediums allow me to express different ideas. I love creating Abstract Art.', 'I’m a housewife. I have done my master’s in Graphic Design.and occasionally making paintings. My style is more like abstract. Nowadays learning calligraphy.', 'https://drive.google.com/file/d/1waY0ZcXVXo5H1woSr8v4ZIkwQpn1mkWL/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1waY0ZcXVXo5H1woSr8v4ZIkwQpn1mkWL&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R78', 'Minha Mansoor', '971503151473', 'minhamansoor2006@gmail.com', 'Yes',
  'A Cup of Persia', 'Painting', 'Acylic on canvas', '60 x 60 cm', '2026',
  'A Cup of Persia is inspired by Persian art, patterns, and culture. I wanted to show the beauty of Persian designs through simple shapes, flowers, and bright colors. The cup of coffee in the center represents warmth, comfort, and hospitality. I used deep red and blue colors to create a rich and traditional feeling. The different patterns around the cup are inspired by Persian carpets and decorations. I wanted the painting to feel warm, colorful, and peaceful. For me, this painting is about enjoying a simple moment while being surrounded by beautiful patterns and cultural memories. The cup is the main focus, while the designs around it create a sense of movement and storytelling. Through A Cup of Persia, I hope viewers can feel the warmth, beauty, and richness of Persian-inspired art and appreciate how traditional patterns can be brought into an everyday scene', 'My name is Minha Mansoor, and I am 18 years old. I am originally from Kerala, India, and currently live in the UAE. I completed my schooling this year. I have a strong interest in art and enjoy expressing my ideas and creativity through painting. Art allows me to explore different colors, patterns, and cultures while creating something meaningful. I am excited to continue learning, developing my artistic skills, and discovering my own style as an artist.', 'https://drive.google.com/file/d/1A1wH-U_6uV0fO84y_YlBkm_Hyvv7j2N0/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1A1wH-U_6uV0fO84y_YlBkm_Hyvv7j2N0&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R79', 'Rosario lopez', '971543902579', 'ruieelopez21@gmail.com', 'Yes',
  'Within', 'Painting', 'Pencil and Watercolor on Paper', '29.7x42cm', '2026',
  'I created this artwork intuitively, without a fixed idea of what it would become. I simply followed the movement of my hand and allowed the lines and shapes to develop naturally. Somehow, my hands seem to know exactly what they are doing, creating patterns and forms that feel connected and balanced. Through pencil and watercolor, I explored harmony, emotion, and self-expression. This piece is a reminder that sometimes creativity comes from instinct, where the process itself reveals the meaning.', 'I am a self-taught artist who enjoys expressing myself through pencil and watercolor. I create my artworks intuitively, letting my hands guide me as the ideas and patterns naturally come together. Art is my way of exploring my imagination and expressing what I cannot always put into words.', 'https://drive.google.com/file/d/1XPPV97rJGkNm_mP32RgGmEWTefzfP3AZ/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1XPPV97rJGkNm_mP32RgGmEWTefzfP3AZ&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R80', 'Mona Jebali', '971509508385', 'm.mohammed0000@outlook.com', 'Yes',
  'Oil Painting', 'Painting', 'Oil Paintings On Canvas', '130*100', '2026',
  'This oil painting depicts a group of female musicians about to enter the hall to begin their performance. The artwork blends Cubism and Expressionism, featuring a harmonious palette of closely related colors.', 'am a Fine Arts educator, curator, and academic leader with over 25 years of service at Ajman University. I have
led the Fine Arts Department, curated more than 110 exhibitions across the UAE and Europe, and mentored
generations of artists who have achieved national recognition and professional success. I specialize in academic
leadership, exhibition curation, cultural event management, and student development. Throughout my career, I
have supervised award-winning student participation in national competitions and represented the UAE in
international artistic platforms. My work reflects a commitment to excellence, innovation, and the advancement of
visual arts as a catalyst for cultural dialogue and creative empowerment', 'https://drive.google.com/file/d/1ECzG6Yp8nd74OUMdxZV2l7jmEMoHPhSh/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1ECzG6Yp8nd74OUMdxZV2l7jmEMoHPhSh&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R81', 'nassim nasr', '971555581505', 'nasrnassim@gmail.com', 'Yes',
  'Building Bridges No. 33', 'Painting', 'Oil Pigment Stick on Canvas', '100x 100 cm', '2025',
  'This work belongs to my Building Bridges series, built entirely around the arch. The series began with a simple idea, that we spend too much time building walls and not enough building bridges. The arch is my answer to that. It is a form shared across cultures and centuries, each one reshaping it, each one passing it on. In this piece the arches interlock and repeat, no single one standing alone. Each depends on the ones beside it. Each colour meets another and changes where they touch.

That is what shared ground means to me. I came to the UAE and it gave me space to build a life and a practice. In return I brought what was mine. That exchange, multiplied across everyone who has made this place home, is what holds the whole structure up. No single arch carries the wall. They all do.', 'Nassim Nasr is a Lebanese artist based in the UAE, working in oil pigment stick on canvas. His practice centres on a single recurring form, the arch. Not architecture but a moment, the instant of crossing, the point just before a decision changes everything. He returns to it again and again, in every colour, holding that threshold open. His work is held in private and corporate collections across more than sixteen countries.', 'https://drive.google.com/file/d/16b7EqB4uqiS_9czgL3gqK6uwdrgvwQ5v/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=16b7EqB4uqiS_9czgL3gqK6uwdrgvwQ5v&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R82', 'Aleksandra Koblova', '971585016553', 'aleksandra.koblova@gmail.com', 'Yes',
  'FLYING HOME', 'Painting', 'Acrylic on linen', '150x100 cm', '2026',
  'Flying Home explores the UAE as a shared ground between memory, movement, and becoming. The work reflects my experience of arriving from Siberia to Dubai and gradually finding a new sense of home through light, openness, and cultural exchange. In my visual language, human and animal figures meet without hierarchy, creating a state of trust and soft inner stability. Here, “home” is not only a place, but a relationship: between past and present, body and landscape, what we bring with us and what a new land gives back.', 'Aleksandra Koblova is a Dubai-based visual artist working in biophilic magical realism. A former head of legal department in a large corporation, she left her legal career to develop an artistic practice centered on softness, trust, animals, and inner states. Her paintings combine simplified forms, faceless figures, deep minimal colors, and dreamlike connections between humans and nature.', 'https://drive.google.com/file/d/10WsAcAYFQv6YEAPJc19sIRkJSkNabpGm/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=10WsAcAYFQv6YEAPJc19sIRkJSkNabpGm&sz=w1600', 'image/png'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R83', 'Shaima Abdelrahim Musa Mohed', '508432775', 'shaimaabdulrhim@gmail.com', 'Yes',
  'TRILOGY OF KUSH', 'Sculpture', 'Fiberglass -epoxy -water based colors', '1ft-2ft-3ft', '2026',
  'I shape the unseen into reality. My practice, built on fiberglass, epoxy, and wood, gives physical form to the workings of the mind: how memory deteriorates, how it can be manipulated, and how it defines identity.

Informed by my studies in molecular and medical genetics, I approach these subjects through both scientific understanding and emotional experience. Chaos of Memories examines the progression of Alzheimer''s disease through a distorted, melting clock. False Memory addresses the wrongful conviction of Michael Taitz and the influence of coercion on testimony. Saligia explores moral temptation through seven carved eyes, observed by a quartz eye symbolizing unattainable perfection.

Across these works, I invite viewers to reflect on how memory, pressure, and conscience shape human identity.', 'Shaima (b. 2006) is a visual artist and sculptor based in the Emirates, currently studying molecular and medical genetics. Her artistic journey began in 2020 during quarantine, when art became a source of refuge and expression. In 2022, she established Shemosculptures, a platform dedicated to creating meaningful works from fiberglass, epoxy, and wood. By 2024, her practice had evolved into a distinctive fusion of emotion and transformative themes. Deeply passionate about the stories and events that shape our world, she describes her vision as "shaping the unseen into reality." For Shaima, art is not merely about beauty but a medium through which thought, effort, and narrative are powerfully conveyed.', 'https://drive.google.com/file/d/1Y2IkPcGFswS9QpsmN-7GQ9AtSY5-MtQO/view?usp=drivesdk', TRUE, '',
  'file', 'https://drive.google.com/file/d/1Y2IkPcGFswS9QpsmN-7GQ9AtSY5-MtQO/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R84', 'fatma abdullha alshehhi', '050 369 9663', '‏alawaifatma123@gmail.com', 'Yes',
  'Between Yesterday and Today', 'Painting', 'Acrylic and oil pastel on canvas, with gold leaf and real fabric integrated into the woman''s clothing to add a realistic and symbolic dimension', '‏70*70', '2025',
  'This artwork captures a visual dialogue between the authenticity of the past and the progress of the present. The lower composition reflects heritage and traditional desert life, while the gilded frame opens as a window overlooking modern landmarks and Burj Khalifa. The rich mix of media highlights the depth of national identity and the harmony between tradition and the future.', 'I am an Emirati visual artist drawn to all dimensions and styles of art, thriving in the expressive space where visual creation meets words. Alongside my passion for painting, I have a natural affinity for writing personal reflections and prose to accompany my artwork. I also incorporate my skills in sewing and handcrafts—integrating textiles, gold leaf, acrylics, and pastels onto canvas—within an expressionist and conceptual framework. Continuously seeking to refine my craft, my goal is to give voice to emotions and thoughts that spoken language often fails to convey, turning each piece into a tactile narrative that connects with the viewer''s inner world.', 'https://drive.google.com/file/d/1DtiVcN2zPiZfqnpUcJ-07IbJuLyEcY5f/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1DtiVcN2zPiZfqnpUcJ-07IbJuLyEcY5f&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R85', 'Odiong Martins', '971504274362', 'marodigon@gmail.com', 'Yes',
  '"TAUSI"', 'Sculpture', 'Mix-media (Clay on Canvas) Materials- Pistachio shells, Clay, fabric, black/ Gold acrylic paint.', '70 X 50cm', '2025',
  'This mixed media piece explores the strength and identity of women by shaping the figure from clay connecting "TAUSI" directly to the land and incorporating fabric that folds her in a sense of shelter and identity and the pistachio shells symbolize strength, crown and personal power.
This art renders the image of a woman using modern materials, that connect the human form of tradition to modernization by bridging the gap between the past and the modern identity of a woman. 
"TAUSI" is an art piece that depicts celebration, and resilience honoring the deep, and broken ties between women, culture and modernization.
The reason I named the art "TAUSI", a Swahili  word which means peacock in English is because it depicts the pride and the beauty of the modern woman.', 'My name is Odiong Martins, from Nigeria, Cross-river state. I am an  in-born, self-taught artist and sculptor based in UAE. I hold a B-Tech honors in Architecture. 
My art style is mix-media, clay sculpting and scrap art.
I believe every form has a function and nothing can be turned into something through art.', 'https://drive.google.com/file/d/1wbJJVyTze4-fGiOosPKs7ldZrbjJjUTP/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1wbJJVyTze4-fGiOosPKs7ldZrbjJjUTP&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R86', 'Alina Erimia', '971568617898', 'erimia.alina@gmail.com', 'Yes',
  'The Woman Head', 'Painting', 'Mix media : Watercolor , engraving through the pressure of 0,3mm mechanical pencil.', '32/43', '2026',
  'My practice draws on the engraving techniques of the fifteenth century, particularly those associated with the Northern Renaissance and the work of Albrecht Dürer. I am interested in the discipline, precision, and visual intensity of early engraving, where meaning is constructed through accumulation rather than scale. This historical language is translated into a contemporary context, becoming a framework through which I examine the role of time, attention, and beauty today.

Working within deliberately small formats, my process is grounded in the meticulous addition of detail, often by the millimeter. Through dense mark-making and subtle gradations, each surface unfolds as a site of close observation. The viewer is invited into a slower mode of looking, where form, rhythm, and nuance emerge gradually through sustained engagement.

By reactivating a historical technique in the present, my work resists the speed and immediacy of contemporary visual culture.', 'Alina Erimia is a fashion designer and educator whose practice explores the intersection of historical craftsmanship and contemporary material innovation. Currently a lecturer at the Academy of Visual Arts , University of Arts Sharjah (UAE), she engages students in developing concept-driven fashion collections through an emphasis on research, technical precision, and experimental processes.

Prior to her academic career, Erimia gained international recognition in Spain and Italy, receiving several prestigious awards, including first prize at The Brandery, Barcelona, and a scholarship from Vogue Italy.', 'https://drive.google.com/file/d/1bJInJTlR3ljzpY07iQUl6822U_ahNKfp/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1bJInJTlR3ljzpY07iQUl6822U_ahNKfp&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R87', 'Diana Shaykhutdinova', '971557754635', 'Shaihutdinova_di@mail.ru', 'Yes',
  'Water lily', 'Painting', 'oil', '150*100 cm', '2026',
  'This painting has been created during 6 month by oil. It has splash of all bright colors of the pallete.', 'Diana Shaykhutdinova (Di_Shaykh) is a Russian artist based in UAE specializing in contemporary, abstract and action works
Artist picked up the paint brush at the age of 10 once she went to art school.
Diana Shaykhutdinova works mainly in oil and acrylic colour to pictorially depict images and thoughts that have touched her. She finds her artistic inspiration in the ordinary and turns to the
canvas when she wants to share a strong emotional response to a personal experience.
Extensive travel and interactions with various cultures continues to influence her work with strong reference to the elements. And she insists on continuing to explore different themes and
directions.
Diana''s paintings have been successfully represented on various international exhibitions and they are generated from the vibration of her positive personality and energy, which she wishes
to pass on to the masses through her canvases', 'https://drive.google.com/file/d/1faGNlu-OZ-Mc8QUXnXFXz5Ly-nXj9y_v/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1faGNlu-OZ-Mc8QUXnXFXz5Ly-nXj9y_v&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R88', 'Kateryna Struzhko', '971585574550', 'studio@katerynastruzhko.art', 'Yes',
  'Between Places', 'Painting', 'Oil on canvas', '91.5x91.5 cm', '2026',
  'In this painting, the rose becomes a point of connection between the intimate and the immense. Rather than depicting a specific place, I use the flower to explore how landscapes can be carried within us — transformed by memory, distance and the way we experience the world around us.

The rose comes from the intimacy of my mother’s garden — a place shaped by family, affection and quiet encounters with nature. The desert represents another kind of landscape: vast, open and constantly shifting, where familiar points of reference disappear and the experience of space becomes almost timeless.

These two landscapes are far apart in place, yet closely connected within my memory. Together, they form the ground from which this work emerges.', 'Kateryna Struzhko is a Ukrainian contemporary artist based in Dubai whose practice explores landscape, atmosphere and human perception. With a background in urban planning and an understanding of architecture and spatial relationships, she approaches painting as a way of translating lived and remembered environments into expressive visual language.

She works primarily in oil, developing series that move between observation and personal memory.

Struzhko has exhibited in the UAE and internationally and has been selected for juried and group exhibitions, including the NBF Art Prize Top 20 and Arts to Hearts Project''s “Spring Through My Eyes.”', 'https://drive.google.com/file/d/1XFxNJZVrDdKLjv2ALIOLmKZuueigC2hd/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1XFxNJZVrDdKLjv2ALIOLmKZuueigC2hd&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R89', 'Chanté Ramiah', '971589466602', 'chanteramiah@gmail.com', 'Yes',
  '"While we are here"', 'Painting', 'acrylic on canvas', '13cm x 18cm', '2026',
  'The UAE has become a magnet for people from different walks of life. In this shared space, we navigate our own sense of purpose while simultaneously shaping, and being shaped by, the environment around us.

Each object in the painting represents a different experience of this exchange. The balloon rises freely, continuing its journey despite being alone. Many arrive alone, yet find a community with whom they can share life. The chair represents comfort, a place to rest and feel grounded amid the constant movement of city life. The potted plant reflects growth and care, flourishing through attention, much like the dreams we nurture while building our lives here.

Together, these objects represent what we bring to the UAE and receive in return: opportunity, growth and inspiration. The UAE is not simply a space we occupy; it is a space we participate in, shaping it as it shapes us.', 'Chanté Tamzin Ramiah is a South African multidisciplinary creative based in Dubai. Working primarily in acrylic, her painting practice explores the meaning that can be found in ordinary, inanimate objects or environments. By removing objects from their familiar context and placing them within imagined environments, she invites viewers to look beyond their physical form and consider the stories, emotions and metaphors they might represent.

Her work is inspired by the surrealism of Salvador Dalí, the quiet narratives of Edward Hopper, and impressionism of Claude Monet. 

Chanté has a professional background in graphic design and photography. Alongside her paintings, she creates fine-art photographic compositions, combining constructed imagery with conceptual ideas.', 'https://drive.google.com/file/d/1ElMZ8ig7VcIeVyO2sNl7sNn2XARc-e5C/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1ElMZ8ig7VcIeVyO2sNl7sNn2XARc-e5C&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R90', 'Rodica Fosnea', '971502937740', 'rodicafosnea@gmail.com', 'Yes',
  'We Belong Through Acceptance', 'Sculpture', 'papier-mâché, acrylic paint, and mixed materials', '88 × 120 × 30 cm (H × W × D)', '2026',
  'We Belong Through Acceptance explores the emotional journey that shapes our sense of belonging. Four interconnected faces move through different emotional states — sadness, feeling lost, frustration, and finally peace — reflecting experiences we encounter throughout life.
Rather than resisting difficult emotions, the work considers them necessary parts of growth. By facing and understanding each state, we move closer to acceptance — not as perfection, but as the ability to embrace ourselves fully.
The visible cracks and contrasting surfaces represent the duality within us: our strength and vulnerability, harmony and imperfection. The final peaceful expression suggests that true belonging is not something we need to find externally. It begins within, when we stop rejecting parts of ourselves and accept who we are as a whole.', 'Rodica Fosnea is a Dubai-based multidisciplinary artist originally from Moldova. With a background in visual communication and more than a decade of creative experience in the UAE, her practice has evolved from design and image-making into painting, sculpture and mixed-media art.
Her work explores human emotion, identity, inner transformation and our relationship with ourselves and the world around us. Through expressive forms, texture and symbolism, she creates pieces that invite viewers to pause, feel and discover their own interpretation.
Rodica’s current practice moves between two-dimensional and sculptural work, driven by experimentation and a belief that art can create meaningful emotional connection.', 'https://drive.google.com/file/d/1hppEYGuF4vdYqQk33JyHhKnUJU0fde5d/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1hppEYGuF4vdYqQk33JyHhKnUJU0fde5d&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R91', 'Courtney Ingram', '971502669411', 'courtneyingram2525@gmail.com', 'Yes',
  'Faces', 'Painting', 'Acrylic on canvas', '90 x 100 cm', '2024',
  'A vibrant celebration of women, identity and individuality. Bold colours, expressive faces and energetic paint splashes come together to capture strength, beauty and the rich diversity.', 'I am a South African artist inspired by the rich colours, culture and artistic traditions of Africa. I paint expressive, vibrant works that explore individuality, emotion and human connection. My paintings celebrate the energy, diversity and beauty of African life through bold colour, movement and texture.', 'https://drive.google.com/file/d/1H5Dv1KJaOMGwkfbeAJtUMwWjrZf4MXaU/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1H5Dv1KJaOMGwkfbeAJtUMwWjrZf4MXaU&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R92', 'Anne Sebastian Anthony', '971551048925', 'anne.anthony@outlook.com', 'Yes',
  'Inner Peace', 'Painting', 'Acrylic on Canvas', '24 by 32 inches', '2026',
  'Created during a period of isolation and turmoil, this work explores the fragile yet enduring nature of inner peace.
A white rose rests delicately within cupped hands—an intimate gesture symbolising the conscious nurturing and protection of tranquility. The rose becomes a quiet metaphor for the self: vulnerable, yet capable of remaining pure and serene amid uncertainty.

The work reflects on the contrast between the turbulence of the external world and the stillness we seek within. It is an invitation to pause, to reconnect with that inner quiet, and to remember that even in the midst of life’s storms, peace can be found, protected, and carried within us.', 'Anne is a medical graduate with a lifelong passion for the arts. Her strong scientific background makes her constantly inspired by natural subject matter.
 Each artwork is an invitation to pause and connect with a feeling, memory, or moment. Rather than simply depicting nature, Anne uses it as a visual language through which emotions and personal experiences can be expressed in a palette of vivid colour.
Anne''s practice reflects a belief that art can create a space for reflection and remind us of our connection to the world around us.', 'https://drive.google.com/file/d/1ZnQpPTNl6Ns4V2VwdNPwUqQhvDshlLpb/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1ZnQpPTNl6Ns4V2VwdNPwUqQhvDshlLpb&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R93', 'Ariana Khirodiniants', '971569267109', 'arianakhirodin1@gmail.com', 'Yes',
  'Arabian horse', 'Painting', 'Acrylic on canvas', '100x80', '2025',
  'Arabian Horse explores the elegance, strength, and spirit of the Arabian horse through a contemporary visual language. The realistic figure of the horse contrasts with a richly textured turquoise background, layered with expressive brushstrokes and touches of gold. The combination of traditional symbolism and contemporary abstraction reflects the cultural atmosphere of the UAE and its connection to the beauty, heritage, and identity of the Arabian world.', 'Ariana Khirodiniants is a contemporary artist from Moscow, Russia, based in Dubai, UAE. With over ten years of experience in painting, her work combines figurative imagery, expressive textures, and contemporary abstraction. Inspired by culture, architecture, nature, and her surroundings, she explores the connection between traditional symbolism and modern visual expression. Her current practice is strongly influenced by the UAE and its distinctive cultural and architectural identity.', 'https://drive.google.com/file/d/148s3wQqcPgqGmuJFOih_FcWRH79sPbKg/view?usp=drivesdk', TRUE, '',
  'file', 'https://drive.google.com/file/d/148s3wQqcPgqGmuJFOih_FcWRH79sPbKg/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R94', 'Priyanka saxena', '971554213381', 'ps1004u@gmail.com', 'Yes',
  '"Blurring the line between the observer and the observed"', 'Painting', 'Oil on canvas', '100x130', '2026',
  '"This piece was born from a desire to create without boundaries. By balancing sharp form with fluid, sweeping strokes, I wanted to strip away rigid physical context and capture the underlying current of human intuition. For me, every mark is an intimate reflection—a direct heartbeat on the canvas."', 'Priyanka Saxena is a contemporary visual artist, interior designer, and art therapist based in Abu Dhabi, UAE. As the founder of "Emerald Art," she creates textured, custom commission paintings and leads therapeutic art workshops. Her intuitive creative practice focuses on bridging raw human emotion with structured physical spaces, frequently painting directly with her hands to channel an authentic connection onto the canvas.', 'https://drive.google.com/file/d/12y85hUe3ZpX10wVTi892nK8b3Ur0Ryjy/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=12y85hUe3ZpX10wVTi892nK8b3Ur0Ryjy&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R95', 'Noha Tosson', '971567137949', 'nhmourad@gmail.com', 'Yes',
  'A Tale of Two Seas', 'Painting', 'Mixed media: charcoal and oil on canvas', '80 x 100', '2026',
  'My work is guided by symbols and feeling.

I’m interested in how the past lives quietly within us, without needing to be explained.

Rather than illustrating history, I let images surface naturally through animals, symbols, forms, and texture. Each painting unfolds through process, intuition, and time.

I see my work as a place where past and present meet in a way that feels familiar and alive.', 'Noha Tosson is an Egyptian contemporary artist based in Dubai, UAE, working in oil and charcoal.

Her work is rooted in symbolism, intuition, and memory, drawing from her Afro-Arab heritage and her connection to ancient Egyptian spaces and imagery.

Through human figures, animals, texture, and atmosphere, she explores instinct, protection, transformation, and the meeting point between past and present.

Her collections unfold as chapters within an evolving visual language, building a world that is both personal and symbolic.', 'https://drive.google.com/file/d/1nQX0yxrsI-T3D8M_XS3nSEgb05bZzYCK/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1nQX0yxrsI-T3D8M_XS3nSEgb05bZzYCK&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R96', 'Burhan Nagarwala', '971569584551', 'burhan.artist@gmail.com', 'Yes',
  'One Humanity', 'Painting', 'Oil on Canvas', '36 x 48 inches', '2026',
  'Behind every identity is a shared human experience. The veil may conceal the face, but it cannot conceal emotion, dignity or connection. Through the eyes, we recognise one another—not as different cultures or backgrounds, but as people standing together on shared ground.', 'I am Burhan Nagarwala, a fine artist and art educator with an MFA in Fine Arts  Painting. My practice explores identity, culture, connection and belonging through expressive portraiture, bold mark-making and experimental painting. I have participated in art exhibitions internationally and completed an intensive Painters Workshop in San Francisco, USA. My work also explores the strength, movement and symbolism of horses, alongside human stories and cultural heritage. As both an artist and international art educator, I aim to create work that connects personal expression with shared human experiences.', 'https://drive.google.com/file/d/1XBKyFKC_aZOSW46mg3RZBxpxSSCLhe6r/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1XBKyFKC_aZOSW46mg3RZBxpxSSCLhe6r&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R97', 'Zainab Hussain', '971 588473868', 'zainabmdhn@gmail.com', 'Yes',
  'Rooted together', 'Painting', 'Acrylic on Canvas', '120 x 60 cm', '2026',
  'The title of the theme "Shared Ground" reminded me of how the UAE has always been a space that not only welcomes different people, but invites them to grow together, hand in hand.
The tree in the painting is from a ground perspective, showing a tree branch made of different browns, representing people of various races and cultures. The tree then grows to sprout a beautiful variety of leaves of different shades, showing the beauty and uniqueness of diversity within unity.', 'I am a 24 year old artist who have spent my whole life growing up in the UAE. It is my home and I am immensely proud to call it so.', 'https://drive.google.com/file/d/1zAKUcic4H-I-P7I6ahfDwUq0t0VUHQxJ/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1zAKUcic4H-I-P7I6ahfDwUq0t0VUHQxJ&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R98', 'Halit HajBakri', '971 (0) 50 974 4043', 'halit@charrette.design', 'Yes',
  'DARAYYA… HUMANITY MASSACRED', 'Painting', 'Canvas paper', 'A3', '2012',
  'At the outset of any undertaking, one finds oneself curiously receptive to whatever presents itself. There comes a fleeting sense of vigour, and of a happiness one quite expects to endure to the last. Revolutions, are much the same', 'Sharjah fine Arts institute
Plastic Arts Institute Aleppo 
DUCTAC art school 
BSc Architecture Aleppo
MSc Urban Planning Birmingham 
PhD Urban Development Oxford', 'https://drive.google.com/file/d/1DvyXPY8BWZM5nJ7NgrQobxW4JwM9-_UW/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1DvyXPY8BWZM5nJ7NgrQobxW4JwM9-_UW&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R99', 'Daria Makarenko', '971585050712', 'makdarye@gmail.com', 'Yes',
  'The three bogatyrd', 'Painting', 'Gouache on paper', '42x59', '2025',
  'This work explores what happens when different worlds are forced to share the same ground. Inspired by the traditional image of the three bogatyrs, I place them alongside unfamiliar, almost alien creatures. What initially appears to be a confrontation gradually becomes something less certain: a moment in which different beings, and identities occupy the same space.
The creatures can be understood as simply beings from another world. Their presence raises a question rather than providing an answer: does difference inevitably lead to conflict, or can a shared space become a place for coexistence?For me It is about what remains after the encounter when there is no longer a clear division between “us” and “them,” and everyone has to negotiate their place within the same world.

The work reflects on belonging, otherness, and the possibility of coexistence between worlds that were never expected to meet.', 'I am a contemporary painter working primarily with oil and gouache. I am drawn to strange
stories, dreams, nature and the feeling that the familiar world can suddenly become
something else.
My paintings often begin with an image, a memory or an imagined situation and develop
into their own small worlds. I am interested in the relationship between figures and their
surroundings, and in using expressive, fluid brushwork to let forms merge with the space
around them.
My work moves between reality and imagination, personal experience and invented
narratives. Some paintings are quiet and observational, while others come from dreams or
fictional stories.', 'https://drive.google.com/file/d/16BAtGOu8c2dtnDaPUiAG_J6ogKWZKB3A/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=16BAtGOu8c2dtnDaPUiAG_J6ogKWZKB3A&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R100', 'Cristina Gabriela Buzatu', '971551108326', 'cristinajoelleart@gmail.com', 'Yes',
  'What We Cannot Write', 'Installation', 'mdf, oils, acrylic, volcanic texture, minerals, bamboo aged paper, fineliner ink', 'apx 90x90x120', '2026',
  'We write history through the way we live together: the homes we build, the paths we cross, the ordinary things we share.

This installation takes the form of an open book surrounded by five suspended drawings. Its left page carries traces of a collective history, unfolding through the drawings into inhabited spaces, encounters and passages. On the right, a solitary figure stands before the unknown.

History holds what humanity has written. Destiny remains beyond the page we can write.

As an artist living in the UAE, among people carrying different histories into a shared place, I reflect on what connects us beneath those differences. We bring memories, shape one another’s lives and become part of a place’s unfolding story. We also share the uncertainty of what comes next. The unknown belongs to every life.', 'Cristina Gabriela is an Italian multidisciplinary artist with Romanian roots, based in Dubai. Working across painting, sculpture and installation, she explores memory, belonging and the human condition. Her practice brings together textured surfaces, architectural thresholds, symbolic writing and small human presences. Through shadow and light, she creates spaces for reflection on what we carry, what we share and what remains unknown.', 'https://drive.google.com/file/d/1TRMSZ8wvkly1QZ4juFxCAJKj6wGqnlhz/view?usp=drivesdk', TRUE, '',
  'file', 'https://drive.google.com/file/d/1TRMSZ8wvkly1QZ4juFxCAJKj6wGqnlhz/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R101', 'ANNUNZIATA TRICARICO', '971509651127', 'annunziata.tricarico@yahoo.com', 'Yes',
  'L’Incontro (The Encounter)', 'Painting', 'Acrylic, oil pastel and charcoal on canvas', '60x60 cm', '2026',
  'L’Incontro (The Encounter)
“L’Incontro” explores human connection and the spaces where different backgrounds meet and become part of a collective dialogue.
Against an atmospheric backdrop of soft hues and dynamic textures, structured black contours interact with fluid, organic forms. The central figures and translucent circular motifs evoke the shifting nature of memory and identity when entering a new environment. Below, grouped silhouettes suggest diverse individuals and stories gathering on a common ground.
Rather than representing physical borders, the work focuses on the emotional and cultural encounter between people, the moment when individual narratives encounter one another and form something shared.
The multitude of figures converging within a golden landscape reflects the transformative experience of living in a diverse environment such as the UAE. Through contrasting layers of light, colour and material density, “L’Incontro” speaks of exchange, resilience and coexistence.
The United Arab Emirates: a land of encounter and unity.', 'Annunziata Tricarico is a self-taught multidisciplinary visual artist, curator, and cultural strategist. Working as a full-time artist since 2018, she holds a Master’s degree in Conservation of Cultural Heritage and brings over twenty years of international experience in marketing and communications across Italy, Belgium, and the UAE.
After receiving a cancer diagnosis in 2022, she returned to painting consistently, marking a new chapter in her artistic practice. Her artistic research unfolds across three interconnected chapters: The Matter, The Line, and The Identity, held together by one constant: the black mark. Working intuitively and without preliminary sketches, she balances spontaneous gesture with formal control.
Her philosophy, “The Beauty of Imperfection,” embraces the unfinished, irregular, and unexpected, recognising imperfection not as a flaw, but as an essential part of beauty, individuality, and human experience.
Her works are held in corporate collections, including Enel and Sogin, and in private collections across Italy, Belgium, and the UAE. She is also the creator of CHEMOod – A Journey Through Illness and the Power of Art, a project exploring the transformative role of art in confronting illness, published in INTIMA, the international narrative medicine journal supported by Columbia University.', 'https://drive.google.com/file/d/15wEaNfdQztGHHICTMe9oVG9fnBOIbD0e/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=15wEaNfdQztGHHICTMe9oVG9fnBOIbD0e&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R102', 'Huseynova Sahire', '552605116', 'huseynovasahire0@gmail.com', 'Yes',
  'The Silent Threshold', 'Installation', 'Handwoven textile, wool and mixed textile materials', '25x15 cm', '2026',
  'The Silent Threshold is a contemporary textile-based installation inspired by Azerbaijani carpet weaving traditions. The work explores the emotional space between the familiar and the unknown, belonging and departure, memory and transformation.

Through geometric forms and a tactile textile surface, the traditional carpet is reinterpreted as a contemporary artistic object and symbolic threshold. Rather than functioning only as a decorative object, the textile becomes a representation of a moment of transition — a quiet space where the past and future meet.

The work reflects my interest in connecting cultural heritage with contemporary artistic expression. By placing the textile within an installation context, I aim to create a dialogue between tradition, space and the viewer.', 'Sahire Huseynova is an Azerbaijani artist and designer working primarily with textile, carpet art and contemporary mixed-media practices. Her work explores cultural heritage, geometric forms, identity, memory and transformation.

With a background in art and design, Huseynova combines traditional Azerbaijani carpet-making references with contemporary visual language. Her practice focuses on transforming familiar materials and techniques into personal and concept-driven artworks.

Her work reflects an interest in the relationship between traditional craftsmanship and contemporary art, with textile often serving as both a material and a medium for storytelling.', 'https://drive.google.com/file/d/1QllZRmeB2g1-2BTfy_dFwsoPCenG4U-V/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1QllZRmeB2g1-2BTfy_dFwsoPCenG4U-V&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R103', 'Anna Peshkova', '971542979752', 'anna.peshkova.arts.00@gmail.com', 'Yes',
  'The Language of Home', 'Painting', 'Oil on canvas', '50 x 70', '2024',
  'Painted soon after my relocation from Ukraine to Abu Dhabi, this still life emerged from a period of careful observation and adaptation. In a new country, domestic objects became more than simple things: they became carriers of atmosphere, habit, and cultural meaning. Through the language of still life, I used the material world of everyday objects to understand my surroundings and to reflect on how a sense of home is gradually built. The work speaks about shared ground not as an abstract idea, but as something formed quietly through daily life - through the meeting of memory, new experience, and the intimate world of ordinary objects.', 'I am a Ukrainian visual artist based in Abu Dhabi, a graduate of the Kharkiv State Academy of Design and Arts, and a member of the National Union of Artists of Ukraine. I work primarily in oil, with a practice rooted in academic realism and focused on portraiture, still life, and landscape. My work is characterised by careful observation, refined colour relationships, and a particular interest in atmosphere, materiality, and the visual character of everyday life. Since relocating to the UAE, my practice has increasingly been shaped by the cultural and visual environment of the Gulf.', 'https://drive.google.com/file/d/1CyU8pArtKVaeTv9E5PGKvgZ30iplX_zV/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1CyU8pArtKVaeTv9E5PGKvgZ30iplX_zV&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R104', 'Mariam Saif', '505087697', 'Mariam.m.saif@gmail.com', 'Yes',
  'Thr Genius in Pinz', 'Installation', 'Corkboard, wood and 21k pushpins', '170x100cm', '2026',
  'The Genius in Pinz
A celebration of creativity, precision, and perspective, “The Genius in Pinz” transforms a portrait into a vibrant pushpin masterpiece. 22,149 pushpins were used to create this masterpiece using only 5 colors of pushpins (Black, White, Red, Blue & Yellow). Each color is carefully placed in a specific pattern to create the details and depth. From up close, you see individual colors and pins; step farther away, and they come together to reveal new colors, shades, and the bigger picture.', 'My name is Mariam Saif, I’m an Emirati artist and a mother who has been creating pixel and pushpin art since 2013. I love exploring different materials and turning simple ideas into unique pieces of art. Through my work, I also help people create their own pushpin artwork by transforming their favorite images into DIY art experiences. I enjoy experimenting, creating, and sharing the fun behind this unique art form. You can explore my work and creations on Instagram at @pinz.uae.', 'https://drive.google.com/file/d/1aPOc3SV4ECfv-7eCC4zj7aAUBeHpyrvs/view?usp=drivesdk', TRUE, '',
  'file', 'https://drive.google.com/file/d/1aPOc3SV4ECfv-7eCC4zj7aAUBeHpyrvs/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R105', 'Naseeba Jamil', '#ERROR!', 'artsbynaseeba@gmail.com', 'Yes',
  'Naqsh - (نقش)', 'Painting', 'Acrylic on Canvas', '40 x 90 cm', '2026',
  'Naqsh (نقش) — translating to pattern or motif in Farsi.
The leopard symbolizes cunning and quiet power a strength that is controlled rather than aggressive. In Mughal art, the leopard was often associated with royalty and nobility, so I painted Mughal-inspired patterns and a jharokha styled in the background to reinforce this legacy.
Traditionally, the jharokha represented prestige and authority, serving as a symbol of power and cultural identity. Jharoka is not just a pattern but part of Mughal history and part of architecture. Together, these elements show the elegance of Mughal artistry that I love seeing in architecture, especially the tile work in mosques. 
Overall it is a way to express how strength coexists with cultural harmony rather than showing conflict in nature, it ties human artistry to wilderness which is represented as Regal and Noble through a leopard.', 'My names in Naseeba Jamil, 19-year-old Visual artist and student whose practice explores the intersection of culture, heritage, and animal symbolism. Working primarily with acrylics, I create deeply narrative paintings that draw inspiration from religious motifs, cultural history, and personal identity. I am passionate about art as a tool for storytelling, I have participated in various exhibitions and community art events, while actively engaging with audiences through public speaking and social media content creation to share my creative journey. As I move forward into studies, my work continues to bridge structured tradition with artistic expression.', 'https://drive.google.com/file/d/1aNGXhPfLN7QsP76pq3ulmdirBuO9DCh6/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1aNGXhPfLN7QsP76pq3ulmdirBuO9DCh6&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R106', 'Noor Alzahrani', '551164203', 'noorzahrani1993@gmail.com', 'Yes',
  'Dream ground', 'Painting', 'Materials: MDF wood, resin, broken glass, acrylic paint, mixed media, and gold mica powder.', '70*35', '2026',
  'Noor Alzahrani is a Saudi-Jordanian visual artist based in the UAE, creating contemporary mixed-media works inspired by heritage, identity, and cultural connection.', 'Noor Alzahrani is a Saudi-Jordanian visual artist based in the UAE. Her practice combines painting and mixed media, drawing inspiration from culture, identity, heritage, and contemporary life. Through vibrant colors, rich textures, and handcrafted techniques, she creates artworks that bridge tradition and modern expression.', 'https://drive.google.com/file/d/1y6bkOxKCtsS9SEQD6sVL97WtqXmsfuZk/view?usp=drivesdk', TRUE, '',
  'file', 'https://drive.google.com/file/d/1y6bkOxKCtsS9SEQD6sVL97WtqXmsfuZk/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R107', 'Ziad Al Halabi', '971556401300', 'ziad.alhalabi@gmail.com', 'Yes',
  'Sea and Sky', 'Painting', 'Acrylic on Paper', '40X40', '2026',
  'The transformation of Syria after 2011 deeply influenced the emotional and conceptual direction
of his practice. Since then, the human being has remained at the center of his artistic attention.
Using lines, paper, sound, photography, and video as emotional tools, his work navigates distance,
movement, fragmented bodies, the sea, travel, suitcases, fear, memory, and the invisible emotional
weight carried by people searching for safety, love, and belonging.
Flowers, open skies, symbolic forms, and human traces repeatedly appear in his work as fragile signs
of hope — reminders that love, land, and human connection can survive even through collapse.
Until today, art remains his way to share something, say something, and scream silently on the canvas.', 'Ziad Al Halabi is a Syrian multidisciplinary artist working across painting, drawing,
installation art, video art, photography, and mixed media.
He graduated from the Faculty of Fine Arts at Damascus University in 2003 and participated in several
artistic experiences and exhibitions exploring painting, installation, video', 'https://drive.google.com/file/d/1aN-d19piTBkV3c0JMxn282UaIxql59yD/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1aN-d19piTBkV3c0JMxn282UaIxql59yD&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R108', 'Taisiia Havryliuk', '971501175672', 'taisiiahavryliuk79@gmail.com', 'Yes',
  'Ukrainian gipsy', 'Painting', 'One of my sketches, for now this is t professional material', '14.8 × 21.0 cm', '2025',
  'One of my sketches)', 'Hi, in short my name is Taia, 30, ftom Ukraine. Currently working (as a stewardess on a yacht)and  living in Dubai. I love painting,  drawings. I wish to contribute UAE art and to start working as professional artist in Dubai.
Kindly ask you to gice me an advice how could I grow more in Dubai and to work fully with art only.
Sincerely,
Taisiia Havryliuk', 'https://drive.google.com/file/d/1gfTmnXo9sPMeX9xk4AmplZlt2bhKdIu3/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1gfTmnXo9sPMeX9xk4AmplZlt2bhKdIu3&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R109', 'Lena Gordeeva', '581287441', 'gopgeeva@gmail.com', 'Yes',
  'the Enter', 'Painting', 'Oil on canvas', '80x140', '2025',
  'My art is attempt to make connection between souls visible. Some paintings are sending special radio signals. Others are answering. And together they create a conversation about spiritual compatibility. 
It is connection between different eras and languages. 
My latest series is about one real and unreal journey to the historic subconscious. There I found a future.', 'I was born in Russia in 1990. 
I studied journalism in Moscow High School of Economics and worked in the main Moscow TV channel for 7 years. 
I graduated from the Institute of British High School of Art and Design in 2016
I studied oil painting in digital art residency RadioPaint for two years 
I’m a contemporary artist. I work at the intersection of painting, animation and performance. 
Now I live in Dubai for four years.', 'https://drive.google.com/file/d/1dEtCcdUH-B6pAB1jY6SB8wepbGEUrmaZ/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1dEtCcdUH-B6pAB1jY6SB8wepbGEUrmaZ&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R110', 'Nooree juneja', '971551106475', 'nooree.juneja1@gmail.com', 'Yes',
  'Sawali', 'Installation', 'Wood work hand painted', '220 cm to 240 cm', '2026',
  'Hi, 
My name is nooree juneja. I am a creative working in dubai for past 8 years. My work is mainly inspired by divine energy and love. 
I''m submitting an installation I''m working on  currently. Its inspired by the illustration i created in 2023.  I started working at an art production company this summer to build this illustration into installation. 
I will attach illustration and AI rendition of installation.', 'I’m a multidisciplinary artist working across digital and traditional mediums. I also work as a gallery manager in Al Quoz, where having access to art production facilities gives me more freedom and ease to experiment with my projects.

The narrative behind my art remains the same, even when I switch mediums. I choose materials based on my mood and what feels right for each project, but my work always comes back to two things: love and courage.', 'https://drive.google.com/file/d/1b5GmT61iAWseyCiUaRJB6WjGZpG9GgRO/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1b5GmT61iAWseyCiUaRJB6WjGZpG9GgRO&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R111', 'Anna Chekh', '971544576447', 'art.anna.chekh@gmail.com', 'Yes',
  'Connection or Dependence?', 'Painting', 'acrylic on canvas', '120x90 cm', '2026',
  'Connection or Dependence? explores the fragile boundary between human connection and human dependence. The work reflects on how shared ground is created through emotional, social, and psychological bonds that shape the way we exist beside one another.
To belong means to be connected, yet every connection carries a tension: it can support and strengthen us, but it can also confine, define, or even consume individual autonomy.
Rather than presenting togetherness as purely harmonious, the work asks a more complex question: at what point does connection stop being mutual support and become dependence?
In this sense, shared ground is not only a place of unity, but also a space of negotiation, vulnerability, and transformation — where identities are continuously influenced by the presence of others.', 'Anna Chekh is an international contemporary artist born in Ukraine, working across painting, sculpture, sculptural objects, installation, and collectible design. Her practice is centered around her signature Shadow Man figure and explores identity, human connection, social structures, and the relationship between individual and collective experience.
Her works have been presented internationally, including during the 2026 Venice Biennale as part of Personal Structures, organized by the European Cultural Centre, at the Giardini Marinaressa Gardens, as well as at the Museum of Contemporary Art (MOCA) Bangkok, DIFC Sculpture Park, the Museum of the Future in Dubai through the Art Be a Part charity auction, and SculptHamptons in New York. Her work has also been featured by Khaleej Times, Al Bayan, Gulf News, Vogue, Tatler, and other international media.
In 2024, Chekh was named a UNESCO Art Ambassador of Ukraine. She is also a holder of a 10-year UAE Golden Visa for Talent and currently develops projects across Europe, Asia, the Middle East, and the United States.', 'https://drive.google.com/file/d/11VHZ8Ws5MKKKLUAJRz2PvluK1VL1lGbc/view?usp=drivesdk', TRUE, '',
  'file', 'https://drive.google.com/file/d/11VHZ8Ws5MKKKLUAJRz2PvluK1VL1lGbc/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R112', 'Joanne Samantha Flores', '971507648758', 'joannesamantha.flores@gmail.com', 'Yes',
  'First Light of Glory', 'Painting', 'Watercolour and Pen', '14.5x21', '2026',
  'Watching the early morning sunrise over Umm Al Quwain, I was filled with genuine awe at the canvas before me. As an expat who arrived in 2015, navigating over a decade of personal growth, each season has deeply honed who I am.
One picturesque memory from 2020 remains vivid while watching local fishermen gather their morning catch and witnessing the vibrant bidding at the fish market. In that experience, I reflected on the boundless goodness of God, knowing that we are all equal in His eyes. The UAE is defined not only by its stunning landscapes but by its remarkably amicable culture and hospitable people. Through all seasons, as we contribute our hard work to this generous nation, it continuously uplifts and embraces us in return.', 'Rooted in faith, capturing the culture, grace, and human connection of over a decade in the UAE.', 'https://drive.google.com/file/d/1S7koF6m0xVjcFKp8b5SsoBJscApCVrPc/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1S7koF6m0xVjcFKp8b5SsoBJscApCVrPc&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R113', 'Graciela Noemi Ghirardosi', '971562798811', 'gracielauae@yahoo.com.ar', 'Yes',
  'Lost between worlds and words', 'Painting', 'Paper collage and acrylic on canvas', '60 x 60 cm', '2026',
  'The artwork depicts a woman walking towards a merged skyline, showing her home town on one side and the UAE, her current place of residence, on the other. 
The elements of the collage in the sky evoke memories (foods, traditions, famous places and people, etc.) from both places, as well as meaningful words and their translations. They reflect on the adaptation that living abroad requires, and the feeling of being an expat, missing home, family, friends and traditions but also, not fully belonging anymore in that place you once left and you keep coming back. The sky, half day, half night, adds to the effect of distance and loneliness felt by expats coming from countries on the other side of the world.
The background includes her CV in Spanish and English, focusing on her achievements on each place, showing adaptation, reinvention and new forms of connection are always possible.', 'Graciela Noemí Ghirardosi is an artist and a veterinary doctor from Buenos Aires, Argentina. Based in the UAE, her work has been showcased at prestigious venues such as Manarat al Saadiyat, Sorbonne University Abu Dhabi, Al Qattara Arts Centre (Al Ain), Al Fahidi Historical Neighborhood (under the patronage of the Minister of Tolerance and Dubai Culture), Dubai Expo 2020 and Tashkeel Dubai, among others. 

She participated in exhibitions and projects for Abu Dhabi Municipality, the Department of Culture and Tourism of Abu Dhabi, the Ministry of Culture and Knowledge Development of UAE and United Nations UAE, with her artwork on Sustainable Development Goals becoming part of the UN’s permanent collection.

She was also part of the project “United for Climate”, an initiative that combined art and sustainability, creating art installations with reusable materials for COP28 and Abu Dhabi Sustainability Week 2026.

Internationally, she took part in exhibitions in Buenos Aires, Tbilisi, Port Louis, Basel, Paris and New York and her artworks are part of private collections in Argentina, United Kingdom, United Arab Emirates and Mauritius.

Passionate about the environment, she published “Mr. No Litter”, a children''s book on sustainability, available in English and Spanish in schools and libraries across Abu Dhabi and Dubai.', 'https://drive.google.com/file/d/1AZ5ZNFW5H7ueUuqyuTsvo4LVPbLEJbzo/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1AZ5ZNFW5H7ueUuqyuTsvo4LVPbLEJbzo&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R114', 'Gonzalo Joel Flor', '541717314', 'info@iamthemoss.com', 'Yes',
  'Closely strangers', 'Painting', 'Spray and moss on hand made canvas', '90x120cm', '2026',
  'Now it is time to play it from memory, the song that rings every day; it feels no fear, adjusts its belly a bit more, and goes on walking. One of the little ones peaks through and darkness begins to fall, some lights break, and others are forced to keep silent, sometimes it is tempted to measure itself with its crooked hand, and the little numbers indicate it is having a hard time. 

Three stripped wires fall to the side, nobody looks, they are kicked like a penalty shot straight down the middle, hard, but cannot scream. But the reflection of colors is not that interesting; it puts on one glove and bandages the other, jumps into the boxing ring without jumping, and crawls while singing that nobody takes risks but everyone screams for freedom. The evening ends, the cameras show a winner; the people claim the other, both lost.', 'I am a contemporary mixed media artist from Argentina based in Dubai. I would be pleased to be considered for your platform. I specialize in handcrafted Biophilic Moss Art, creating high-end, textured, three-dimensional pieces.  

An artist is not born in a specific year, rather, there is a sequence of events where something uncomfortable awakens, needing to be transferred onto another plane, energy, ideas, or perhaps just words that fall short of becoming such, yet deserve to be spoken in some way.', 'https://drive.google.com/file/d/1kyiSux_npEkaj7EJWN5EpNq17BGVqBp6/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1kyiSux_npEkaj7EJWN5EpNq17BGVqBp6&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R115', 'GIANCARLO CERVINO', '971505798751', 'giancarlocervinopainter@gmail.com', 'Yes',
  'Dancers', 'Painting', 'acrylics on canvas', '90x120', '2026',
  'This painting explores dance as a silent dialogue between two people. The dancers’ embrace forms the heart of the composition, while flowing bands of red, blue, yellow and dark tones extend their movement across the canvas. Their elongated silhouettes merge with the surrounding colours, blurring the boundary between the figures and the space they inhabit. With facial details left undefined, gesture and rhythm carry the emotion. The work invites the viewer to feel the balance between strength and tenderness, individuality and unity, captured in the simple act of moving together.', 'BIOGRAPHY
GIANCARLO CERVINO
Visual Artist · Author · Cultural Heritage Researcher · Independent Art Adviser
Biographical Note
Giancarlo Cervino is an Italian visual artist, author, and researcher in the fields of cultural heritage, archaeology, and art history.
His multidisciplinary education underpins an artistic practice that brings together visual culture, historical knowledge, critical reflection, and an interpretation of the contemporary world. His work moves between figurative painting, abstraction, mixed media, and symbolic narrative.
His research is concerned in particular with memory, identity, presence and erasure, the condition of women, relations of power, geopolitical tensions, social exclusion, and the possibilities for transformation afforded by art. Certain series also address the realities of imprisonment as a field of reflection on human dignity, isolation, freedom, and resilience, without making these subjects the sole focus of his practice.
In his recent works, Giancarlo Cervino favours an immediate visual language structured around colour, rhythm, the figure, and the symbol. His pictorial language alternates between figurative compositions, abstract forms, and images with a social or political dimension, while remaining consistently attentive to human experience.
Artistic and Professional Practice
Alongside his artistic production, Giancarlo Cervino pursues an independent art advisory practice. His experience encompasses advising collectors, the study of primary and secondary markets, the formation and enhancement of collections, and consideration of how works of art, antiques, and design objects may be integrated into interior spaces.
His artistic practice employs acrylic and oil paint, mixed media, collage, charcoal, watercolour, wax, and photography.
It is characterised by a sustained enquiry into the relationship of the figure to space, of the visible to the invisible, of memory to erasure, and of the individual to collective transformations.
Artist’s Statement
I regard art as a space for knowledge, memory, and transformation.
My education in cultural heritage, archaeology, art history, and art criticism has led me to understand each work as the outcome of a dialogue between contemporary experience, historical inheritance, and symbolic language.
My painting moves freely between figuration and abstraction. Some works take human presence, portraiture, or the body as their point of departure; others use colour, repetition, and rhythm to evoke invisible connections, memories, identities, or collective tensions.
The female figure occupies an important place in my research. She is represented not merely as an object of the gaze, but as an autonomous presence, a force of consciousness, transmission, and transformation.
Other works examine the mechanisms of power, conflicts, geopolitical fractures, exclusion, and the various forms of deprivation of liberty. Themes of imprisonment form part of this broader reflection on dignity, isolation, and resilience, without constituting its sole dimension.
For the selection prepared for the United Arab Emirates, I have favoured works capable of establishing a dialogue with an international audience through readily apprehensible images, symbols, and cultural references. This selection brings together the power of colour, abstraction, the human figure, memory, and a critical reading of the contemporary world.
My aim is to create works that can be viewed on several levels: as visual experiences, as spaces for reflection, and as meeting points between different cultural sensibilities.
Contact Details
Giancarlo Cervino
Email: giancarlocervinopainter@gmail.com
Telephone: +971 50 579 8751
Instagram: @gian_painter_archaeologist', 'https://drive.google.com/file/d/1qz6IUsGni5pxuV8Dg_fE0FnsJQwTsuNS/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1qz6IUsGni5pxuV8Dg_fE0FnsJQwTsuNS&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R116', 'Mariam Ziad Ayoub', '971544440855', 'bymariam.ziad@gmail.com', 'Yes',
  'The Authenticity', 'Painting', 'acrylic on canvas and acrylic on MDF', '40x60', '2025',
  'The Authenticity brings together a woman, a falcon, and the Ghaf, the UAE''s national tree, on one stretch of desert. Each is a symbol of Emirati heritage, and each stands on the same ground: the land that shaped our traditions. The falcon rises before the woman and covers half of her face, so that one eye meets the viewer while the other is held by the bird, as if they share a single gaze. Crystals on her dress and the textured details add touches of the present to a timeless scene. As the UAE moves swiftly into the future, this painting reminds us that authenticity is our common ground, and it is ours to preserve.', 'Mariam Ziad is a freelance visual artist based in Ajman, UAE, working since 2019. A graduate of the University of Sharjah (BA, Interior Architecture and Design), she works across several mediums and specializes in detailed portraiture. Her work has been exhibited in Sharjah, Abu Dhabi, and Dubai, and featured on Sharjah TV and Al Fujairah TV.', 'https://drive.google.com/file/d/1e_SyjPrnz6nXDat_4sVREmLWZ8YckXNe/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1e_SyjPrnz6nXDat_4sVREmLWZ8YckXNe&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R117', 'Washington Rhodes', '971509145740', 'gene_campbell1@yahoo.com', 'Yes',
  'Puppet Master', 'Painting', 'Acrylic on canvas', '90 x 120 cm', '2026',
  '“I am interested in how we are represented in art. How we represent ourselves in a space that has not always been accessible to us,” Rhodes says. “Rather than focusing only on the absence of Black figures in museums and galleries, I challenge how black is defined and looked upon, reclaiming the concept of blackness as a positive force and black figuration as symbols of empowerment.”
Rhodes’s recent anthropomorphic series weaves together political allegory, history, and cultural narratives, pointing to the humanity of people and how they are represented.', 'Washington Rhodes is an artist  born in Decatur, Georgia. Known for his evocative acrylic paintings, he explores existential themes and fractured identities through a visual language that merges elements of Conceptualism and Surrealism. His work frequently challenges stereotypes rooted in themes of race, gender inequality, religion, and status by interrogating historical narratives, and juxtaposing them against a reimagined vision of black representation. Rhodes uses pictorial allegory to infuse his art with profound social commentary.', 'https://drive.google.com/file/d/18p040KxTIL0bKhM3CNpnPiQb0dca_AQn/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=18p040KxTIL0bKhM3CNpnPiQb0dca_AQn&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R118', 'Evgeniya Gatalskaya', '971522249012', 'jworld0111@gmail.com', 'Yes',
  'Golden Mirage', 'Painting', 'Acrilic, golden leaf, plywood', '41 x 41 cm', '2026',
  'My artistic practice explores the relationship between nature, light, texture, and the human experience of change. I am interested in how places, memories, and cultural environments shape our sense of belonging and become part of our identity.

Living in different countries and cultures has deeply influenced my perspective. Nature is often the starting point for my work, from flowers and underwater landscapes to mountains, deserts, and Eastern ornamental patterns. I transform these subjects into tactile, reflective surfaces that invite viewers to slow down and experience the work through changing light.

I work with textured relief, acrylic, gold and silver leaf, resin, and natural materials. My engineering background also influences my artistic language, bringing precision and structure into dialogue with organic forms and intuitive processes.

Through this contrast, I explore transformation, resilience, connection, and adaptation, seeking harmony within change while preserving the emotional memory of places and experiences', 'Evgeniya Gatalskaya is a contemporary artist based in Dubai, UAE. Originally trained as an aircraft design engineer, she transitioned to a professional art practice in 2022, bringing a distinctive sense of precision, structure, and attention to detail into her work.

Inspired by nature, travel, and her experience of living across different cultures, Gatalskaya creates tactile, light-responsive works that explore memory, transformation, belonging, and connection. Her practice combines textured relief, acrylic, gold and silver leaf, resin, and unconventional natural materials. Through the interplay of texture and reflective surfaces, she creates works that shift with changing light and invite viewers to slow down, observe, and reconnect with the emotional experience of place.', 'https://drive.google.com/file/d/1QiifSLYpZ0r6iMHe7djoa8eH0_JxiaWy/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1QiifSLYpZ0r6iMHe7djoa8eH0_JxiaWy&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R119', 'Tina Gavasheli', '585049838', 'info@gavacreativestudio.com', 'Yes',
  'Éveil”', 'Painting', 'Acrylic on canvas', '130x110', '2026',
  'Éveil explores the moment between stillness and emergence. A single form moves through the canvas like a cloud, a wave, or the fragment of an ancient architectural column deliberately resisting a fixed interpretation. The work transforms fluid movement into a structure that feels both organic and monumental.
The deep blues suggest depth, memory and atmosphere, while the areas of untouched ground create pauses within the composition, allowing the form to appear suspended rather than contained. I’m interested in this tension between movement and structure: how something seemingly weightless can carry the presence of something ancient.

The title Éveil awakening refers to this state of becoming: a form emerging into consciousness, between the remembered and the imagined, the natural and the constructed.', 'Tina Gavasheli is a Dubai based artist whose work translates the complexity of human emotion into large-scale abstract works. Working primarily with acrylic on canvas, she creates layered compositions that reflect the way feelings emerge not neatly or singularly, but in waves overlapping and contradicting each other.
Her practice embraces the philosophy of flow and presence. Each canvas becomes a concentrated emotional universe: immersive, self-contained, and designed to hold the viewer in a singular moment of reflection.
Gavasheli expanded her international footprint by collaborating with galleries across the US, Europe, and the Middle East.
Coming from a strong corporate and luxury background, Gavasheli carries into her studio the discipline, clarity, and strength of that background. Yet her paintings, murals and sculptures open a very different record, one that embraces vulnerability, intuition, and strength all at once.', 'https://drive.google.com/file/d/1nMinIuHC9-l27R_u_6MRmxHxPxrSH-Tt/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1nMinIuHC9-l27R_u_6MRmxHxPxrSH-Tt&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R120', 'Ghia Haddad', '971506540043', 'ghiahaddad@me.com', 'Yes',
  'Hayyakum', 'Painting', 'Fabric on wood', '91 x 61 cm', '2026',
  'Hayyakum is made entirely from fabric, without a drop of paint. I use fragments of different colors, patterns and textures as I would use paint, to form a traditional Emirati doorway. Each fragment carries its own identity, while the whole creates something new.
Hayyakum is a traditional expression of welcome in the UAE, rooted in a culture where hospitality means opening one’s door to the traveller, passer-by and guest. During Expo 2020 Dubai, the word came to embody that welcome for the world.
The UAE has been my home for many years. I have brought my own history and experiences to it, while being changed by what I received in return. This doorway stands on that shared ground: rooted in Emirati tradition, made from difference, and open to possibility. Above all, it represents what this country continues to teach me: to keep my door and my heart open.', 'Ghia Haddad is a multidisciplinary artist, writer, and researcher whose practice bridges fine art, textile traditions, and cultural heritage. Holding degrees in Graphic Design, Art History, and Museum Studies, she combines paint, embroidery, beads, and textiles to explore identity, memory, and belonging while challenging the historic divide between craft and fine art. Alongside her studio practice, her research examines decolonial narratives, museum practices, and the role of textiles as cultural archives. Ghia has exhibited internationally and regularly presents, writes, and teaches on the intersections of art, heritage, and contemporary visual culture.', 'https://drive.google.com/file/d/1vMrvIW_1Cqgu9HFODwg2UH-sT1rxZS_-/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1vMrvIW_1Cqgu9HFODwg2UH-sT1rxZS_-&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R121', 'Sunitha Gopal', '971503439874', 'sunartcafe@gmail.com', 'Yes',
  'Eight Fishes', 'Painting', 'Watercolor on paper', '58x44cm', '2024',
  'My practice begins with close observation. I am drawn to subjects
that appear tamiliar - faces, animals, domestic objects, interiors,
architectural fragments and surfaces marked by time - because
they can hold meanings that are not immediately visible. I use
realism as a way of staying with a subject long enough for
memory, atmosphere and emotional presence to emerge.
Born in Kerala and raised in the Gulf, I work from an experience
shaped by movement between South Asian cultural memory and
the lived environment of the UAE. I am interested in how heritage
survives quietly through objects, gestures, materials, spaces and
everyday rituals, and in how those meanings change as people
move between places and generations.
SUNITHA GOPAL
Contemporary Realist Artist | UAE
I work across oil, watercolour, acrylic, charcoal, graphite and
mixed media. My process is built through drawing, tonal structure,
layered colour, texture and close attention to light.', 'Sunitha Gopal is an Indian, UAE-based contemporary realist artist,
educator, and Founder & Director of SUNARTCAFE FZE in Sharjah.
Born in Kerala and raised in the Gulf, she has developed a
multidisciplinary practice across painting, drawing, watercolour,
oil, acrylic, charcoal, graphite, mixed media and surface-based
work.
In 2026, she was selected for CONVIVIO - From Italian Literature
to Art: The Practice of Erasure at the Italian Cultural Institute, Abu
Dhabi, participating in the artistic residency on 26 September.
Work developed through the programme is scheduled for the
collective CONVIVIO exhibition from 22 October to 5 November
2026.
SUNITHA GOPAL
Founder & Director, SUNARTCAFE FZE | Sharjah, United Arab Emirates
Her other recent presentations include The Glitch: Fragmented
Becoming at Al Shindagha Museum, Dubai; Where Memory
Resides, a curated online solo exhibition with No.35 Gallery,
London; and the Ahal-Teke Horse international art competition at
Peelbergen Equestrian Centre, Netherlands. She is also a
confirmed participating artist in the Qatar International Art Festival
2026 at Katara Cultural Village, Doha.
Alongside her studio practice, Sunitha is a Guest Lecturer in the
BSc Animation Programme at Manipal Academy of Higher
Education, Dubai Campus. Through SUNARTCAFE, she develops
fine-art projects, commissions, workshops, structured art
education, mentorship and selected creative collaborations.', 'https://drive.google.com/file/d/1j4A6HmfDI5A2TOAr_6o_PoowheyrrAtN/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1j4A6HmfDI5A2TOAr_6o_PoowheyrrAtN&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R122', 'Yaroslava Fedorova', '971585498879', 'yarajiho@gmail.com', 'Yes',
  'Music, Love and Peace', 'Painting', 'Acrylics, mix media on canvas', '70×100', '2025',
  'TITLE: MUSIC, LOVE &PEACE

MOOD: Energetic, Playful, Rebellious, Optimistic

An expressive mixed-media composition exploring the connection

Between music, freedom, and inner peace. Vibrant turquoise, violet, and the

pink

Tones contrast with bold black-and-white geometric patterns, while a flowing

Ribbion of color moves through the work like a steam of sound.

The words “Music,Love,Peace” bring the composition together as a message

Of harmony, creativity, and connection.

On this painting i used acrylics, paper, leather glove.', 'My name is Yaroslava,  and im a self taught artist from Uzbekistan,  based in Dubai. I love to express my feelings, emotions and  vision through the layers of paints and adding pieces of what I see around myself.', 'https://drive.google.com/file/d/1125-FlxncxpWqkjOdzDLkMi8E48aNqSZ/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1125-FlxncxpWqkjOdzDLkMi8E48aNqSZ&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R123', 'takeshi harikai', '971529117804', 'takeshiharikai@gmail.com', 'Yes',
  'Ukiyoe x Dubai', 'Painting', 'Printed Art', '120 x 90cm', '2026',
  'Ukiyo-e × Dubai is a series inspired by my fourteen years of living in Dubai. Drawing from memory, I depict the landscapes, architecture, and scenes that have stayed with me, reimagining them in the style of traditional Japanese ukiyo-e.
Ukiyo-e is a classical Japanese art form known for its distinctive use of perspective and stylized depictions of clouds and space. Rather than portraying Dubai with geographical accuracy, these works bring together fragments of memory, almost like a collage of places, people, and moments accumulated over the years.
Throughout the works, I have also included some of the distinctive characters you might encounter while walking around Dubai: Filipino men playing basketball, glamorous women alongside wealthy men, shawarma vendors at work, and many others. These figures are scattered throughout the scenes, reflecting the unique mix of people and everyday life that has shaped my memories of Dubai.', 'Born in 1988 and raised in Tokyo, Japan, Takeshi has been based in Dubai since
2012, working as an architect while pursuing illustration as a personal creative
practice.
He holds a Master’s degree in Architecture from the Graduate School of Science
and Technology at Tokyo University of Science.
During his university years, his work was exhibited at various art and architecture
events, including the Kobe Biennale and the Architecture Tokyo Collection.', 'https://drive.google.com/file/d/11Cc6xMk9sa48tKvvXcLE6wh7l7De3JnR/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=11Cc6xMk9sa48tKvvXcLE6wh7l7De3JnR&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R124', 'Nadine Ramadan', '971555665509', 'nadine.rofficial@outlook.com', 'Yes',
  'Kingdom of Chance', 'Painting', 'Acrylic on canvas', '8 canves ( 160x60 cm )', '2026',
  'Kingdom of Chance a statement piece inspired by the game we all play 
8 canvas born separate , bound as one', 'Im Nadine .R an artist crafting oil and acrylic paintings that combines modern elegance with soulful emotion. I lived in uae for 19 years , have a bachelor of fine arts', 'https://drive.google.com/file/d/1L_G0DBJ_WYmqI3T9fRGt4LOJ19TC3dD-/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1L_G0DBJ_WYmqI3T9fRGt4LOJ19TC3dD-&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R125', 'Aparna Shere', '971507630501', 'shere.aparna@gmail.com', 'Yes',
  'Cosmic Harmony', 'Painting', 'Acrylics on Canvas', '90 * 120cms', '2006',
  'Cosmic Harmony is a tribute to the dear souls who have departed yet continue to live within our hearts. The glowing pearl-like forms represent these souls, each enclosed within its own shell and carrying its own light, memories, and enduring presence. Though they are no longer physically with us, their energy remains woven into our lives. The black and violet tones symbolize the vastness and mystery of the universe, while vibrant pinks, white dots, and touches of silver express love, cherished memories, and the warmth they leave behind. The swirling cosmic movement reflects the journey from life into another realm. A passage we may never fully understand, yet one that reminds us of love’s eternal nature. Here I share a simple truth: those we love may leave this world, but they never truly leave us. Memories  become stars, their love our light, and their presence continues guiding us from beyond.', 'Aparna Shere is a self-taught realistic artist with over 25 years of experience in painting and more than 20 years of experience in teaching art. Her work reflects her deep connection with nature, people, animals, emotions, and life experiences. Working mainly with acrylics, watercolours, and mixed media, she focuses on capturing realistic details, expressions, and emotions. Her artistic journey has taken her across India and the Middle East, including Qatar, Oman, Bahrain, and the UAE. Her paintings have been exhibited, published, and sold internationally. Recently, Aparna has started creating short videos to share the stories, thoughts, and emotions behind her paintings, giving viewers a glimpse into her creative world.', 'https://drive.google.com/file/d/1Y0coq0rB7ga9OqeQrj0Bsu8q85sdHe--/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1Y0coq0rB7ga9OqeQrj0Bsu8q85sdHe--&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R126', 'Shrutika Gosavi', '971551165453', 'shrutika.gosavi@yahoo.com', 'Yes',
  'Time-Space-Memory-1', 'Painting', 'Acrylic, Ink, Rice-Paper on Paper', '70 x 90 cm', '2024',
  '"The Time Space Memory-1" is a part of an evolving series. The artwork is created using acrylics, ink, and graphite on rice paper, which is then pasted onto a main paper. The rice paper is treated with various inks and colors to add texture and depth.
My inspiration for this series comes from my university days, where I immersed myself in observing the world around me studio work, sculptures, anatomy studies from Zolf sculptures and life drawings, and visits to museums and galleries. This series includes drawings of heads and portraits of sculptures that have profoundly influenced me. Also a study of myself in different spaces.', 'Shrutika Gosavi is a UAE-based multidisciplinary visual artist and art educator from India, holding a Master Degree in Fine Arts and practicing professionally as a full-time artist since 2011. She has participated in Sikka and numerous exhibitions, received the Emerging Artist Award at World Art Dubai (2020), and was awarded the UAE Golden Visa through Dubai Culture (2021). Her practice spans ink, intuitive, figurative and abstract art, textiles and string art, alongside workshops and lectures in institutions around UAE', 'https://drive.google.com/file/d/11-55jo2zSoKMIqtP5XAmt6uTT6jiQ-Xg/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=11-55jo2zSoKMIqtP5XAmt6uTT6jiQ-Xg&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R127', 'Sadulla Dawletow', '99361257551', 'sadulladawletow60@gmail.com', 'Yes',
  '" Шёлковый путь"- дорога домой', 'Painting', 'Холст масло', '1''10 × 0''90', '2025',
  'Название появилось благодаря шёлку, который был главным товаром из Китая. Путь возник || веке до н.э. во времена династии Хань в Китае. Дороги делились на северную и южную ветви проходящие через Центральную Азию , Памир,Иран и Ближний Восток. Территория современного Туркменистана была Ключевым узлом и " сердцем" Шёлкового пути. Это тема для меня было трогательно и играл особенную роль в искусстве. И постарался создать обстракцию в восточном колорите.', '1. Давлетов Садулла Хасанович.
2. Тел. +99361257551 sadulladawletow60@gmail.com 
3. Дата рождения: 1960 08.22.
4. Образование: Учился в Академии художеств. П. П. Бенькова Узбекистан Ташкент.
после окончания института меня направили работать в сферу образования учителем. Опыт преподавания 37 лет. Сейчас занимаюсь творчеством создаю произведения искусства.', 'https://drive.google.com/file/d/1VwiDgqbCYLdjieMvogoShSUqZgJhI_7D/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1VwiDgqbCYLdjieMvogoShSUqZgJhI_7D&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R128', 'teng miras', '971566301432', 'tengmirasdxb@gmail.com', 'Yes',
  'fragments of life', 'Installation', 'mixed media', '5ft', '2026',
  'My lamps explore the idea of finding light within broken and imperfect moments. Using fragments, textures, and handmade forms, I transform simple materials into objects that carry stories of loss, hope, shelter, and new beginnings.

Even through the cracks, there is still light.', 'Teng Miras — Multidisciplinary Artist

Teng Miras is a self-taught multidisciplinary artist based in Dubai, working across painting, mixed media, sculpture, textiles, and upcycled materials. Her practice explores the fragments of human experience—loss, memory, conflict, nature, shelter, dreams, and the quiet traces left behind by change.

Working intuitively and without fixed patterns, Miras transforms discarded materials, textured surfaces, fabric, paper, concrete, thread, and found objects into contemporary works that hold both vulnerability and resilience. Her signature use of spontaneous lines and stitches reflects the imperfect paths of life: marks that can represent scars, connections, movement, or a thread of hope.

Her ongoing body of work, Fragments of Life, considers how broken pieces can be reassembled into something meaningful. A fragment may come from a home, a memory, a landscape, a relationship, or a moment of destruction—but when brought together, these pieces can create a new sense of identity and belonging.

Miras’ approach is experimental, tactile, and intentionally imperfect. Through her work, she invites audiences to slow down, look closer, and find beauty not in perfection, but in what remains, what survives, and what can still be rebuilt.', 'https://drive.google.com/file/d/1rb1rp-Eby9AmoXsbeCyqc78kOST4AMC9/view?usp=drivesdk', TRUE, '',
  'file', 'https://drive.google.com/file/d/1rb1rp-Eby9AmoXsbeCyqc78kOST4AMC9/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R129', 'Diana Khamidullina', '971562148980', 'dianarust2003@gmail.com', 'Yes',
  'Support', 'Painting', 'Oil on canvas', '36 x 46 cm', '2026',
  'Built around a single gesture — a hand resting on the shoulder. For me, this is above all a gesture of self-support: something the body does on its own, without words, when there''s anxiety or unease inside. The figure''s face is hidden, shown from behind — what matters isn''t who this is, but the moment itself, where a person is left alone with their state and finds a way to hold themselves together. The warm pink background and soft light create a sense of enclosed, almost intimate space — the pause in which this happens.', 'Diana is an artist based in Dubai, working in oil painting and drawing. She started art school at four, and art has been the constant of her life ever since. Her work explores everyday moments, drawn from her own life and the lives of the people around her. Alongside her personal practice, she leads art workshops for children and adults in Dubai. She works from a studio at Al Hamriyah Studios, Sharjah Art Foundation.', 'https://drive.google.com/file/d/1T7WAb1pQTR7CiqbzDr9GSbR1CmvSClPT/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1T7WAb1pQTR7CiqbzDr9GSbR1CmvSClPT&sz=w1600', 'image/png'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R130', 'Gulalek Esenova', '971551288997', 'gt.artgallery@gmail.com', 'Yes',
  '"SYNTHESIS- 02 GT"', 'Sculpture', 'Recycled Sculpture', 'H2m x 60cm', '2026',
  'LIFE explores the Human being as a space where nature, technology, experience, and environment intersect. Created from recycled materials, the life-size cyber sculpture transforms what has been discarded into a new form of life — reflecting how different elements can be brought together to create a shared future.

Recycled Cyber Sculpture — a life-size fusion of recycled materials and futuristic Human form.', 'Gulalek Esenova (GTnArt) is an Engineer-Architect and international multidisciplinary Artist based in the UAE, working across 3D Optic Paper Art, recycled-paper art, sculpture, and creative innovation. Her practice explores the relationship between technology, culture, identity, sustainability, and the future, transforming unconventional and recycled materials into distinctive contemporary artworks.

She is the Official Representative of the Union of Artists of Turkmenistan in the UAE and serves as President of the Turkmenistan Department of IAA UNESCO Clubs. She has participated in and contributed to numerous international and UAE exhibitions, cultural projects, and art initiatives, with her work and activities featured across media and international art platforms.

Through her artistic practice and international cultural work, she builds connections between Turkmenistan, the UAE, and the wider global art community, bringing heritage and contemporary artistic innovation into dialogue.', 'https://drive.google.com/file/d/1tiE5Nr81nv3g4mvGY-kobr2_NFeOfO9Q/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1tiE5Nr81nv3g4mvGY-kobr2_NFeOfO9Q&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R131', 'Fatima Abdulla Fundikira', '#ERROR!', 'fatumera@gmail.com', 'Yes',
  '“Put Yourself Together, Girl!”', 'Painting', 'Acrylic & oil pastel on canvas', '40 cm x 50 cm', '2026',
  'This is an abstract portrait of a woman who is working on pulling  herself back together after going through a trying or challenging time in her life.', 'I am an Abu Dhabi retiree who enjoys expressing feelings, thoughts & memories with my art. I make abstract and intuitive art using mainly acrylics, oil pastels and anything I can get my hands on', 'https://drive.google.com/file/d/1kxPFuApl-3PI83jJEAoWsucCtGSbXgOs/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1kxPFuApl-3PI83jJEAoWsucCtGSbXgOs&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R132', 'Suboh ASEEL', '508974010', 'aseel.suboh@hotmail.com', 'Yes',
  'Shomoukh - Pride', 'Painting', 'Acrylics on canvas', '70x100cm', '2026',
  '“Dignity” explores Arab identity, strength, and cultural heritage through the portrait of a woman and a falcon. The woman’s calm yet powerful gaze represents dignity, resilience, and quiet strength, while the falcon symbolizes freedom, courage, and connection to the land. Turquoise, deep blue, and gold bring together contemporary painterly expression with elements inspired by Middle Eastern patterns and Arabic calligraphy. Through this work, I wanted to celebrate the beauty of identity—not as something fixed in the past, but as a living heritage carried confidently into the present.', 'Aseel Suboh is a Canadian artist and art educator based in the UAE, with over a decade of experience in art and design education. Coming from a proud Arab background, her cultural heritage is an important influence on her artistic practice. Through expressive portraiture, bold colour, texture, and symbolism, she explores identity, heritage, strength, and the connection between traditional culture and contemporary art. Her work celebrates Arab identity while presenting it through a personal and modern artistic perspective.', 'https://drive.google.com/file/d/12_naw6Ivn9bEx1Mhfhu5VZQ0vy4UxW6n/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=12_naw6Ivn9bEx1Mhfhu5VZQ0vy4UxW6n&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R133', 'Shareena Mohamed', '971562123940', 'thezerene22@gmail.com', 'Yes',
  'Silent Lifelines', 'Painting', 'Acrylic and texture on canvas', '60*80cm', '2025',
  'Not every lifeline is loud. Some are built quietly - layer by layer, moment by moment. In the UAE, where people from different parts of the world share a home, the work invites us to consider how much of our common ground is built quietly -through what we bring, what we exchange, and what we create together.', 'From a busy Pharmacist & mom, to an artist, what began as a small escape slowly became my passion. My journey is still unfolding, one textured layer at a time- and I''m grateful that my art now finds a place in the hearts and homes of others.
Making art has always been my passion and over  time time I discovered the beauty of abstract textures and the depth it brings to a space.', 'https://drive.google.com/file/d/1v7aYUm2hnWg2BD1rwoiakj7kyczVWMeo/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1v7aYUm2hnWg2BD1rwoiakj7kyczVWMeo&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R134', 'Rawan Hijazi', '971554866412', 'hello@r1creatives.com', 'Yes',
  'Stillness in Blue', 'Painting', 'Acrylic on Canvas', '50 x 70', '2026',
  'My work explores the relationship between colour, light, and everyday objects. I enjoy observing how simple subjects can become visually interesting through contrasts, reflections, and subtle changes in tone.

In Stillness in Blue, I combine cool turquoise shades with the rich purples of grapes and the warmth of an orange to create a balanced composition. The interplay of light and shadow adds depth, while the arrangement encourages a closer look at the forms, textures, and details of each object.

Through this painting, I invite viewers to pause and appreciate the beauty of ordinary things, finding interest and meaning in moments of stillness.', 'Rawan Hijazi is a Palestinian artist and multidisciplinary creative based in the United Arab Emirates. Her work spans traditional and digital art, including painting, drawing, and architectural sketching. She explores colour, composition, and visual expression across different mediums. Her achievements include winning first prize in the COP28 Art Challenge and receiving recognition in international and university art competitions. Through her artistic practice, she continues to develop her visual language and explore new ways of communicating ideas through art.', 'https://drive.google.com/file/d/19EwJO7Cm-H3hXd_emaBE-QEb-d1RnCY2/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=19EwJO7Cm-H3hXd_emaBE-QEb-d1RnCY2&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R135', 'Rajat Aarav Mohan', '971505112423', 'shradha@amrg.in', 'Yes',
  'Origami', 'Sculpture', 'Origami paper', '28*31 cms', '2026',
  'I have made room having closet, big bed , small bed for baby, a diary, 2 study table with chairs and twisted lamp.', 'I am Aarav Mohan. I love making with origami paper. I have been making from last 2yrs. I have gifted many origami things to my friends.', 'https://drive.google.com/file/d/1pZ4FrRFytEigASACjOUjd8eggt5eL9UP/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1pZ4FrRFytEigASACjOUjd8eggt5eL9UP&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R136', 'Alina Hoile', '971524265563', 'alinafalter@ya.ru', 'Yes',
  'In the Kingdom', 'Painting', 'Canvas print', '75x75 cm', '2026',
  'Artist Statement

This artwork explores the delicate connection between humanity and the natural world through an imagined encounter between a young girl and the endangered Arabian leopard.

Set against the majestic mountains of the Arabian Peninsula, the scene captures a moment of trust, wonder, and silent understanding. The girl’s gentle gesture symbolizes hope, compassion, and the responsibility of future generations to protect our natural heritage.

The dreamlike sky, celestial elements, and warm sunset tones blur the boundaries between reality and imagination, presenting the Arabian leopard not merely as an endangered species, but as a guardian of the land’s ancient spirit.

Through this work, I seek to inspire emotional connection with wildlife and remind viewers that conservation begins with empathy. By protecting the Arabian leopard, we preserve not only a species, but also the cultural identity, beauty, and living heritage of Arabia.', 'Alina Hoile is a visual artist and photographer born in Krasnoyarsk, Russia. Alina comes from the family of artists and started creating art from a very young age. She studied in Krasnoyarsk Surikov’s art school, Krasnoyarsk Surikov’s art college (theatrical scene and decorations painting), Siberian Federal University (graphic design), Moscow State Pedagogical University (art pedagogics). Such versatile education gave her the skills necessary for working in various spheres of art. Alina is working both as an art teacher and a freelance artist and currently based in UAE.', 'https://drive.google.com/file/d/1Pxln4y47oFuso9Rzqf7Ad2ugUdvw-rC5/view?usp=drivesdk', TRUE, '',
  'file', 'https://drive.google.com/file/d/1Pxln4y47oFuso9Rzqf7Ad2ugUdvw-rC5/view', 'application/pdf'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R137', 'Yang Lan', '971508969112', 'yanglan.art@gmail.com', 'Yes',
  'From Above_Away from City', 'Painting', 'oil on canvas', '145 x 175 cm', '2024',
  'In From Above—Away from City, I explore how distance and a shift in perspective can transform our relationship with a place. Viewed from above, the city becomes a field of light, colour, and movement, suspended between recognition and abstraction. The atmosphere blurs the boundary between the urban environment and the surrounding sky, inviting a moment of reflection on what it means to belong to a place.

Living and working across different countries has shaped my understanding of landscape as something continually transformed by movement, memory, and experience. Now based in the UAE, I see home not simply as a fixed location, but as a shared space shaped by different lives, cultures, and perspectives. Through expressive brushwork and layered colour, this painting reflects the distance that can bring us closer to understanding our connection with the places we inhabit—and the ground we share.', 'Yang Lan is a Dubai-based contemporary painter and art educator originally from China. She holds an MFA in Studio Art from the University of Saskatchewan, Canada, and a BA in Visual Arts (Painting) from the University of Jordan, Amman. Working primarily with oil painting and mixed media, her practice explores landscape through shifting perspectives, atmosphere, memory, and ecological transformation. Drawing on her experiences of living and working across different countries, Lan investigates how movement, perception, and environmental change shape our relationship with place. Her paintings move between observation and abstraction, reflecting the dynamic forces of nature and the evolving meanings of home and belonging.', 'https://drive.google.com/file/d/1RuKx2Ya7oAGi_jtcutBNY26TGaGwImcm/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1RuKx2Ya7oAGi_jtcutBNY26TGaGwImcm&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R138', 'Andrew Thompson', '971506517724', 'athomuk@gmail.com', 'Yes',
  'Humat Al-Watan', 'Painting', 'Oil on board', '122cm x 122cm', '2026',
  'This painting was inspired and painted during the recent challenges the UAE experience as a nation.
I am an expat of 34 years, and what I experienced in this stressful time created an immense pride in this nation I have called home for so long.
This painting is a reflection of a nation that does not forget it''s roots, it''s fortune and is spirit and unified against an approaching storm.
 From the Al Saqr perched high on the sign looking into the approaching storm not afraid, to the people running and gathering under the flag on the distant dunes as a unified force. National pride, unity, tradition and strength.', 'Expatriate aviation engineering professional with a passion and dedication to painting', 'https://drive.google.com/file/d/15B5-pX9bH82BZSkmB7gGTcJfuX4YtBWB/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=15B5-pX9bH82BZSkmB7gGTcJfuX4YtBWB&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R139', 'Ratna Pattnaik', '971563198216', 'pattnaikratna469@gmail.com', 'Yes',
  'Lord Ganesh remover of problems', 'Sculpture', 'Clay', 'Not sure', '2020',
  'Lord Ganesha gives message tht wisdom is not linked to appearance. He is know as god of wisdom and intelligence. Along with remover of obstacles', 'I''m ratna Pattnaik.im 28 years old. I have studied b.a media and communication with animation as specialisation. I have taken part in many art exhibitions and competition and won award in those categories', 'https://drive.google.com/file/d/1JI-wqmP1624CPnSf8Qlp3sPU9IhxAhEh/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1JI-wqmP1624CPnSf8Qlp3sPU9IhxAhEh&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R140', 'Samaneh Ziaei', '971547237325', 'shadi.ziaei2016@gmail.om', 'Yes',
  'The Sea Collection', 'Sculpture', 'Ceramic - Color & Glaze', '40x20x20', '2026',
  'Mizuki 🤗💌🌼💆🏻‍♀️:
🖼 Photo

Mizuki 🤗💌🌼💆🏻‍♀️:
She was not born of water—she is shaped from earth. Yet within her lies an undeniable longing: to swim, to move, to be free. This fish may well be a reflection of myself: born on dry land, yet forever dreaming of the sea. In my work, the fish becomes a metaphor for existing within unfamiliar or uninhabitable spaces, while somehow carrying a deep, intuitive resonance with them. She embodies a paradox—rooted yet restless, grounded yet guided by currents unseen. Through this sculpture, I explore the tension between origin and aspiration, and the quiet courage it takes to dream beyond one’s given environment.', 'Shadi Ziaei is an Iranian contemporary artist based in Dubai, UAE, with a background in sculpture. Her multidisciplinary practice spans sculpture, ceramics, and contemporary jewellery, exploring the relationships between materials, forms, and memory. Through experimentation with traditional techniques and unconventional materials, she creates works that combine craftsmanship, sensory experience, and contemporary artistic expression.', 'https://drive.google.com/file/d/1vqUOaZQu633HeL0sxiiZcHoQoyXYwLb7/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1vqUOaZQu633HeL0sxiiZcHoQoyXYwLb7&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R141', 'Diego Yañez Garcia', '971554580085', 'diegoyg@outlook.es', 'Yes',
  'ALIVE', 'Painting', 'ACRYLIC ON CANVAS', '120x90', '2024',
  '“An abstract encounter where imaginary bodies intersect, overlap, and transform into a dance of color, tension, and movement.”', 'Hello! My name is Diego Yáñez, from Spain living in Dubai. Art is a way to express my creativity to the world.', 'https://drive.google.com/file/d/1bSJDQPUCFKOt-N3aCoQ6wOwgsUSKtygH/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1bSJDQPUCFKOt-N3aCoQ6wOwgsUSKtygH&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R142', 'Izmer Bin Ahmad', '971568053187', 'izmerahmad@protonmail.com', 'Yes',
  'Without Eyes II', 'Painting', 'Charcoal on cardboard paper', '67 x 48 cm', '2017',
  'Without Eyes explores the shifting relationship between identity, memory, and belonging. The partially obscured face emerges through layers of charcoal, erasure, and repeated marks, suggesting a self that is continually formed and transformed through encounters with others. The absence of clearly visible eyes disrupts the usual exchange of recognition, shifting attention from how we see one another to how we experience, remember, and carry one another. Through the tension between presence and disappearance, the work reflects on the traces we leave, absorb, and share, presenting identity not as fixed, but as something continually shaped through connection and exchange.', 'Dr. Izmer Bin Ahmad is trained as a practicing artist as well as an academic researcher. His professional
profile encompasses both studio practice and scholarly writing. As an artist, Bin Ahmad''s work focuses
mainly on drawing and painting, which have been exhibited in various exhibitions, particularly in
Malaysia and Canada where he previously lived and taught. His academic research and publication
have been converging primarily about the body and modern Malaysian art, especially in examining the
manifestation of somatic nationalism in Malaysian artistic and cultural production. His current research
Interest revolves around artistic research. Bin Ahmad is an Assistant Professor of Fine Arts and Dean of the Department of Fine Arts.', 'https://drive.google.com/file/d/1OaETqALyKojGH0p9C2r4_y84hFhjVCDx/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1OaETqALyKojGH0p9C2r4_y84hFhjVCDx&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R143', 'Elham Shafaei', '971509835847', 'elishafaei@gmail.com', 'Yes',
  'Home-Woven', 'Sculpture', 'Hand-stitched on PU leather, mounted on wood', '88x45x2 cm', '2025',
  'This work considers the body as a site of inscription—a surface upon which language, memory, displacement, and encounter leave their traces. The fragmented form resists the idea of identity as whole or fixed; instead, it suggests a self continually written and rewritten through what is inherited, lost, encountered, and remembered. The handwritten Persian text inhabits the body like a residue of experience, making language both intimate and material. Within Shared Ground, the work proposes that what connects us is not sameness, but the accumulation of traces we carry into our encounters with one another. The body becomes both boundary and meeting place: personal yet permeable, singular yet shaped by exchange.', 'Elham Shafaei (b. 1983) is an Iranian artist and curator currently based in the United Arab Emirates. She holds a Bachelor’s degree in Painting from the School of Arts at the University of Science and Culture in Tehran, as well as an M.A. and Ph.D. in Fine Arts from Universiti Sains Malaysia.
Elham’s work and research focus on experimental processes, exploring diverse mediums such as painting, papermaking, photography, installation, textile art, sound, and video art to express her concepts. Her artistic practice often delves into human existential conditions, including themes of loneliness, emptiness, and freedom. Additionally, she explores the connections between these themes and ideas of home, memory, displacement, and diaspora.
In addition to her artistic practice, Elham is the Co-Founder and Co-Editor of ContemporaryIdentities, an international online art magazine.', 'https://drive.google.com/file/d/1_PVfw3KqxRco6OQE4gFx6FvOTdSN4pAI/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1_PVfw3KqxRco6OQE4gFx6FvOTdSN4pAI&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R144', 'Kusay Bader', '585570452', 'amassifarah@gmail.com', 'Yes',
  'Untitled', 'Painting', 'Acrylic on canvas', '150 x 120 cm', '2026',
  'My art practice is rooted in a visual exploration of nature and the environment, shaped by a deep sensory memory of landscapes I have encountered — particularly in Greece and Spain. Valleys, plateaus, lakes, and open terrains become emotional and symbolic spaces through which I reflect on the relationship between humanity and the natural world.

Through these landscapes, I seek to evoke both the serenity and vulnerability of nature, drawing attention to the urgent need for environmental care and preservation. In several works, traces of human impact emerge subtly or dramatically, revealing wounded and impoverished environments shaped by excessive human intervention.', '*Bio*
Rooted in sculpture, painting, and design, my practice unfolds as a continuous inquiry into form, memory, and spatial perception. I hold a Bachelor of Arts in Fine Arts (Sculpture), 1996. Alongside my artistic journey, I based in Dubai, where I serve as Art Director at Miracle Flight Support, an aviation company-bridging creative vision with its sector.

My professional path has extended across cultural institutions and editorial plat-forms. I have contributed as a member of the General Secretariat of the Sharjah Award for Art criticism, Highlighting the analytical and critical importance accompanying the artwork, where I also worked as editor and preparer of the award. I previously served as Artistic Editor for visual arts programs at the Department of Culture, Government of Sharjah, and as a journalist for the Maraya supplement of Al Bayan newspaper in Dubai.

I have worked as a portrait artist for Dubai Cultural Magazine, in addition to developing extensive experience in caricature and character design for children''s television programs and series broadcast on Spacetoon. My professional portfolio also includes designing book covers and interior layouts for several publications issued by the United Nations, as well as serving as an editor for a range of cultural and social magazines. Furthermore, I have designed stage sets for theatrical productions and created logos and visual identities for numerous companies. I am a member of the Fine Artists Association in the UAE.

My artwork has been exhibited internationally across multiple platforms in Paris Monaco, Greece, Italy, Dubai, Sharjah and most recently in Abu Dhabi where I held a solo exhibition at Art Booth Gallery.

Through these engagements, my work continues to evolve within a dialogue between environment and contemporary expression, shaping visual narratives that move between structure, emotion, and abstraction.', 'https://drive.google.com/file/d/169oweWlg2P3c-r06GFpfYWI1yYjoe0dx/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=169oweWlg2P3c-r06GFpfYWI1yYjoe0dx&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R145', 'Celine Hubert Tawakol', '971552861493', 'celine-tawakol@hotmail.com', 'Yes',
  'ESSENCE جوهر (Jawhar)', 'Painting', 'Acrylic on canvas', '50x60', '2026',
  'ESSENCE explores the connection between nature, cultural identity, and the sense of belonging.

Inspired by the landscape and cultural heritage of the United Arab Emirates, the painting brings together the hoopoe, the palm tree, and geometric forms in a contemporary visual language.

The hoopoe, a bird found across different regions and cultures, becomes a symbol of movement, connection, and shared experiences. The palm tree represents roots, resilience, and the land that brings people together.

As a French artist living in Dubai, I experience the UAE as a meeting point of cultures, where different backgrounds coexist and influence one another.

Through ESSENCE, I explore this shared space, where nature and cultural identities meet, creating a sense of connection beyond geographical boundaries.', 'My name is Céline Hubert Tawakol , I am a French visual artist based in Dubai, United Arab Emirates.

With a background in Applied Arts and Fashion Design, I have developed a strong sensitivity to colour, composition, patterns, and textures.

Having lived in France, China, and the United Arab Emirates, my artistic perspective is shaped by different cultures and environments.

Working primarily with acrylic painting, I draw inspiration from nature, wildlife, and the visual richness of my surroundings. My work combines vibrant colours, geometric forms, and calligraphy, exploring the relationship between nature, cultural identity, and contemporary artistic expression.', 'https://drive.google.com/file/d/1OSqWb3tqic5v4ECI3_I4UIPspQiYuvcw/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1OSqWb3tqic5v4ECI3_I4UIPspQiYuvcw&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R146', 'Diana Shaykhutdinova', '971557754635', 'Shaihutdinova_di@mail.ru', 'Yes',
  '"Water lily"', 'Painting', 'Oil on canvas', '150×100', '2026',
  'In this piece, the crowded water lily pond serves as a living metaphor for ''Shared Ground.'' A lily pond is not merely a collection of isolated flora, but an interconnected ecosystem where every root, pad, and blossom relies on the same body of water to survive and thrive. For an artist, this mirrors our collective social landscape—an environment enriched by diverse backgrounds coming together, sharing resources, and blooming in unison.', 'Diana Shaykhutdinova (Di_Shaykh) is a Russian artist based in UAE specializing in contemporary, abstract and action works.
Artist picked up the paint brush at the age of 10 once she went to art school.
After her graduation from 2012 till 2015 she has been traveling and living in different countries - Singapore, Jordan, Egypt, Turkey, Indonesia, South Korea..
But none of those countries attracted the artist for more than 6 months until she discovered UAE in 2015. Here Diana found everything she was looking for.
Diana Shaykhutdinova works mainly in oil and acrylic colour to pictorially depict images and thoughts that have touched her. She finds her artistic inspiration in the ordinary and turns to the canvas when she wants to share a strong emotional response to a personal experience.
Diana''s paintings have been successfully represented on various international exhibitions and they are generated from the vibration of her positive personality and energy, which she wishes 
to pass on to the masses through her canvases.', 'https://drive.google.com/file/d/1AODJPBJKfWsZ1BGFB4GBVTTQ5MN11lNQ/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1AODJPBJKfWsZ1BGFB4GBVTTQ5MN11lNQ&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;

insert into submissions (id, artist_name, mobile, email, uae_resident, title, discipline, medium, dimensions, year, statement, bio, art_link, eligible, ineligible_reason, image_type, image_url, image_mime_type) values (
  'SG-R147', 'Rahul kumar', '565789171', 'infobumblingart@gmail.com', 'Yes',
  'If I stay, I lose myself ….. if I leave, I lose you', 'Painting', 'Pen and oil pastels on paper', '20.5 x 29 cm', '2024',
  'This artwork is a map of an impossible choice: two figures-one is grounded, one is suspended beneath a streetlight are connected only by a single trembling red heart, pierced by a blue compass whose arrows pull in every direction at once.
The clouds above contrast with the cold glow of the streetlight that illuminates but doesn’t guide, capturing that intimate moment when love and self-preservation no longer point that same way. 
The work holds the grief of knowing that to stay is to lose yourself, and to leave is to lose the other.', 'I was born in India into a world rich with culture, color, and craft. I am drawing and designing for as long as I remember.
My work blends intuitive gestures with emotional storytelling. My work often raw and executed in mixed media.
Currently working in an art gallery in Dubai and deeply influenced by the multicultural art community of the UAE.', 'https://drive.google.com/file/d/1RVoCirJkg2ZqPRowLBzh0qHXxYfi8v69/view?usp=drivesdk', TRUE, '',
  'image', 'https://drive.google.com/thumbnail?id=1RVoCirJkg2ZqPRowLBzh0qHXxYfi8v69&sz=w1600', 'image/jpeg'
) on conflict (id) do update set artist_name = excluded.artist_name, mobile = excluded.mobile, email = excluded.email, uae_resident = excluded.uae_resident, title = excluded.title, discipline = excluded.discipline, medium = excluded.medium, dimensions = excluded.dimensions, year = excluded.year, statement = excluded.statement, bio = excluded.bio, art_link = excluded.art_link, eligible = excluded.eligible, ineligible_reason = excluded.ineligible_reason, image_type = excluded.image_type, image_url = excluded.image_url, image_mime_type = excluded.image_mime_type;


-- Votes (1 rows)

insert into votes (juror_id, submission_id, vote, comment, updated_at) values (
  'U-juror2', 'SG-0001', 'love', '', '2026-10-09T05:47:48.555Z'::timestamptz
) on conflict (juror_id, submission_id) do update set vote = excluded.vote, comment = excluded.comment, updated_at = excluded.updated_at;
