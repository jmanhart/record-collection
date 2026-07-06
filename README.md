# Record Collection

A simple React app to manage your vinyl record collection.

## Quick Start

```bash
pnpm install       # Install dependencies
pnpm run dev       # Start dev server
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start local dev server |
| `pnpm run build` | Production build |
| `pnpm run lint` | ESLint (strict, zero warnings) |
| `pnpm run sync:discogs` | Sync records from Discogs to Supabase |
| `pnpm run sync:discography` | Sync discography targets with Discogs metadata |
| `pnpm run sync:readme` | Regenerate this README with album covers |
| `pnpm run sync:all` | Run discogs + readme syncs |
| `pnpm run backup` | Backup all tables locally to `backups/` |
| `pnpm run backup:push` | Backup locally + push to GitHub backup repo |
| `pnpm run restore` | Dry-run restore (prints plan, no changes) |
| `pnpm run restore:execute` | Restore from most recent backup |
| `pnpm run article:new` | Scaffold a new MDX article |

## Collection

Total Records: 213

<table>
<tbody>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/14578598.jpeg" width="200" alt="1"/><br/>
      <sub>1 - The Beatles</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/765071.jpeg" width="200" alt="12 X 5"/><br/>
      <sub>12 X 5 - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/28638091.jpeg" width="200" alt="1989 (Taylor's Version)"/><br/>
      <sub>1989 (Taylor's Version) - Taylor Swift</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/25087453.jpeg" width="200" alt="2"/><br/>
      <sub>2 - Mac Demarco</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/26240321.jpeg" width="200" alt="24 Hours A Day"/><br/>
      <sub>24 Hours A Day - The Bottle Rockets</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4834205.jpeg" width="200" alt="6 Feet Beneath The Moon"/><br/>
      <sub>6 Feet Beneath The Moon - King Krule</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/765072.jpeg" width="200" alt="Aftermath"/><br/>
      <sub>Aftermath - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2147575.jpeg" width="200" alt="A Good Feelin' To Know"/><br/>
      <sub>A Good Feelin' To Know - Poco (3)</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2652389.jpeg" width="200" alt="A Little Street Music"/><br/>
      <sub>A Little Street Music - The Cambridge Buskers</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/35229295.jpeg" width="200" alt="A Love Supreme"/><br/>
      <sub>A Love Supreme - John Coltrane</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/3329043.jpeg" width="200" alt="American Anthems And Circus Marches"/><br/>
      <sub>American Anthems And Circus Marches - Unknown Artist</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2915539.jpeg" width="200" alt="American Beauty"/><br/>
      <sub>American Beauty - The Grateful Dead</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/30236624.jpeg" width="200" alt="A Night At The Opera"/><br/>
      <sub>A Night At The Opera - Queen</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/24104555.jpeg" width="200" alt="Animals"/><br/>
      <sub>Animals - Pink Floyd</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/35255551.jpeg" width="200" alt="Another One (10-Year Anniversary Edition)"/><br/>
      <sub>Another One (10-Year Anniversary Edition) - Mac Demarco</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/700498.jpeg" width="200" alt="Bachman-Turner Overdrive II"/><br/>
      <sub>Bachman-Turner Overdrive II - Bachman-Turner Overdrive</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/16368330.jpeg" width="200" alt="Balloonerism"/><br/>
      <sub>Balloonerism - Mac Miller</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2363745.jpeg" width="200" alt="Barry Goudreau"/><br/>
      <sub>Barry Goudreau - Barry Goudreau</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/16233494.jpeg" width="200" alt="Because The Internet"/><br/>
      <sub>Because The Internet - Childish Gambino</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2165840.jpeg" width="200" alt="Beggars Banquet"/><br/>
      <sub>Beggars Banquet - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/9283492.jpeg" width="200" alt="Being No One, Going Nowhere"/><br/>
      <sub>Being No One, Going Nowhere - Starfucker (2)</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4173766.jpeg" width="200" alt="Benny Goodman Plays World Favorites In High-Fidelity"/><br/>
      <sub>Benny Goodman Plays World Favorites In High-Fidelity - Benny Goodman</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/32237577.jpeg" width="200" alt="Bird In Kansas City"/><br/>
      <sub>Bird In Kansas City - Charlie Parker</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2520757.jpeg" width="200" alt="Black And Blue"/><br/>
      <sub>Black And Blue - The Rolling Stones</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/10374059.jpeg" width="200" alt="Black Sabbath"/><br/>
      <sub>Black Sabbath - Black Sabbath</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/7537431.jpeg" width="200" alt="Blues Groove"/><br/>
      <sub>Blues Groove - Coleman Hawkins</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/26825126.jpeg" width="200" alt="Bluey Dance Mode!"/><br/>
      <sub>Bluey Dance Mode! - Joff Bush</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/413016.jpeg" width="200" alt="Bonnie Koloc"/><br/>
      <sub>Bonnie Koloc - Bonnie Koloc</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4969532.jpeg" width="200" alt="Born On Flag Day"/><br/>
      <sub>Born On Flag Day - Deer Tick</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/7172803.jpeg" width="200" alt="Brain Cream"/><br/>
      <sub>Brain Cream - Jaill</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/605328.jpeg" width="200" alt="Bridge Over Troubled Water"/><br/>
      <sub>Bridge Over Troubled Water - Simon & Garfunkel</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6117480.jpeg" width="200" alt="Cavalo"/><br/>
      <sub>Cavalo - Rodrigo Amarante</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/8255546.jpeg" width="200" alt="Changes"/><br/>
      <sub>Changes - Charles Bradley</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1542557.jpeg" width="200" alt="Christmas"/><br/>
      <sub>Christmas - Kenny Rogers</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/28546231.jpeg" width="200" alt="Circles"/><br/>
      <sub>Circles - Mac Miller</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/8160854.jpeg" width="200" alt="City To City"/><br/>
      <sub>City To City - Gerry Rafferty</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2095408.jpeg" width="200" alt="Close To You"/><br/>
      <sub>Close To You - Carpenters</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/37558221.jpeg" width="200" alt="Coin-O-Matic"/><br/>
      <sub>Coin-O-Matic - Deer Tick</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/7146187.jpeg" width="200" alt="Coming Home"/><br/>
      <sub>Coming Home - Leon Bridges</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/31177270.jpeg" width="200" alt="Contractual Obligations"/><br/>
      <sub>Contractual Obligations - Deer Tick</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/35280490.jpeg" width="200" alt="Coral Fang"/><br/>
      <sub>Coral Fang - The Distillers</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/28142506.jpeg" width="200" alt="Data Doom"/><br/>
      <sub>Data Doom - Frankie And The Witch Fingers</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1481054.jpeg" width="200" alt="Dear Science"/><br/>
      <sub>Dear Science - TV On The Radio</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1132195.jpeg" width="200" alt="Déjà Vu"/><br/>
      <sub>Déjà Vu - Crosby, Stills, Nash & Young</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/3566933.jpeg" width="200" alt="Diamond Rugs"/><br/>
      <sub>Diamond Rugs - Diamond Rugs</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4538845.jpeg" width="200" alt="Dirty Work"/><br/>
      <sub>Dirty Work - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/25136785.jpeg" width="200" alt="Disco Two Step"/><br/>
      <sub>Disco Two Step - Me Like Bees</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/3190006.jpeg" width="200" alt="Divine Providence"/><br/>
      <sub>Divine Providence - Deer Tick</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/31471502.jpeg" width="200" alt="Dummy"/><br/>
      <sub>Dummy - Portishead</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2760013.jpeg" width="200" alt="Dust"/><br/>
      <sub>Dust - Screaming Trees</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6173334.jpeg" width="200" alt="Eating Us"/><br/>
      <sub>Eating Us - Black Moth Super Rainbow</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/706098.jpeg" width="200" alt="Either / Or"/><br/>
      <sub>Either / Or - Elliott Smith</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/399579.jpeg" width="200" alt="Electric Ladyland"/><br/>
      <sub>Electric Ladyland - The Jimi Hendrix Experience</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/451183.jpeg" width="200" alt="Electric Warrior"/><br/>
      <sub>Electric Warrior - T. Rex</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/27368748.jpeg" width="200" alt="Emotional Contracts"/><br/>
      <sub>Emotional Contracts - Deer Tick</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/774235.jpeg" width="200" alt="Emotional Rescue"/><br/>
      <sub>Emotional Rescue - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1454102.jpeg" width="200" alt="Every Damn Time"/><br/>
      <sub>Every Damn Time - Black Diamond Heavies</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1300351.jpeg" width="200" alt="Excitable Boy"/><br/>
      <sub>Excitable Boy - Warren Zevon</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/15281308.jpeg" width="200" alt="Exile On Main St"/><br/>
      <sub>Exile On Main St - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/28190572.jpeg" width="200" alt="Exmilitary"/><br/>
      <sub>Exmilitary - Death Grips</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/32300096.jpeg" width="200" alt="Fishing For Fishies"/><br/>
      <sub>Fishing For Fishies - King Gizzard And The Lizard Wizard</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/27366222.jpeg" width="200" alt="Five Easy Hot Dogs"/><br/>
      <sub>Five Easy Hot Dogs - Mac Demarco</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/33670557.jpeg" width="200" alt="Fleetwood Mac"/><br/>
      <sub>Fleetwood Mac - Fleetwood Mac</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4450748.jpeg" width="200" alt="Floating Coffin"/><br/>
      <sub>Floating Coffin - Thee Oh Sees</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/24142475.jpeg" width="200" alt="Françoise Hardy"/><br/>
      <sub>Françoise Hardy - Françoise Hardy</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/5423326.jpeg" width="200" alt="Geffery Morgan"/><br/>
      <sub>Geffery Morgan - UB40</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/33676614.jpeg" width="200" alt="Get Behind The Mule (Spiritual)"/><br/>
      <sub>Get Behind The Mule (Spiritual) - Tom Waits</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/24234656.jpeg" width="200" alt="Get Fucked"/><br/>
      <sub>Get Fucked - The Chats (2)</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/23836325.jpeg" width="200" alt="'Get Yer Ya-Ya's Out!' The Rolling Stones In Concert"/><br/>
      <sub>'Get Yer Ya-Ya's Out!' The Rolling Stones In Concert - The Rolling Stones</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/15229038.jpeg" width="200" alt="Ghostbusters (Original Soundtrack Album)"/><br/>
      <sub>Ghostbusters (Original Soundtrack Album) - Various</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2916148.jpeg" width="200" alt="Gimme Some"/><br/>
      <sub>Gimme Some - Peter Bjorn And John</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/441777.jpeg" width="200" alt="Goats Head Soup"/><br/>
      <sub>Goats Head Soup - The Rolling Stones</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2965191.jpeg" width="200" alt="Greatest Hits"/><br/>
      <sub>Greatest Hits - The Brothers Four</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/34889003.jpeg" width="200" alt="Guitar"/><br/>
      <sub>Guitar - Mac Demarco</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/11747418.jpeg" width="200" alt="Gumboot Soup"/><br/>
      <sub>Gumboot Soup - King Gizzard And The Lizard Wizard</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/28524538.jpeg" width="200" alt="Hackney Diamonds"/><br/>
      <sub>Hackney Diamonds - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6138354.jpeg" width="200" alt="Hail Mega Boys"/><br/>
      <sub>Hail Mega Boys - J Roddy Walston And The Business</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/7986029.jpeg" width="200" alt="Half The City"/><br/>
      <sub>Half The City - St. Paul & The Broken Bones</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/13798684.jpeg" width="200" alt="Harvest"/><br/>
      <sub>Harvest - Neil Young</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/8258120.jpeg" width="200" alt="Heartattack And Vine"/><br/>
      <sub>Heartattack And Vine - Tom Waits</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/13114012.jpeg" width="200" alt="Heart On"/><br/>
      <sub>Heart On - Eagles Of Death Metal</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/14962141.jpeg" width="200" alt="High Risk Behaviour"/><br/>
      <sub>High Risk Behaviour - The Chats (2)</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/7227829.jpeg" width="200" alt="Highway 61 Revisited"/><br/>
      <sub>Highway 61 Revisited - Bob Dylan</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/5473862.jpeg" width="200" alt="Holly"/><br/>
      <sub>Holly - Nick Waterhouse (2)</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4245199.jpeg" width="200" alt="II"/><br/>
      <sub>II - Unknown Mortal Orchestra</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6377274.jpeg" width="200" alt="I'm In Your Mind Fuzz"/><br/>
      <sub>I'm In Your Mind Fuzz - King Gizzard And The Lizard Wizard</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/35911765.jpeg" width="200" alt="I'm Nice Now"/><br/>
      <sub>I'm Nice Now - Upchuck (2)</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6091558.jpeg" width="200" alt="In Concert"/><br/>
      <sub>In Concert - The Clancy Brothers & Tommy Makem</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4062017.jpeg" width="200" alt="In Sweden 1950"/><br/>
      <sub>In Sweden 1950 - Charlie Parker</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/13505187.jpeg" width="200" alt="Interaction"/><br/>
      <sub>Interaction - Art Farmer Quartet</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/12753004.jpeg" width="200" alt="In The Aeroplane Over The Sea"/><br/>
      <sub>In The Aeroplane Over The Sea - Neutral Milk Hotel</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/12415623.jpeg" width="200" alt="Jazz At Massey Hall"/><br/>
      <sub>Jazz At Massey Hall - Charlie Parker</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1696796.jpeg" width="200" alt="Jazz Goes To College"/><br/>
      <sub>Jazz Goes To College - The Dave Brubeck Quartet</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/15929556.jpeg" width="200" alt="John Prine"/><br/>
      <sub>John Prine - John Prine</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/7539360.jpeg" width="200" alt="JR JR"/><br/>
      <sub>JR JR - Jr Jr</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2825456.jpeg" width="200" alt="Kind Of Blue"/><br/>
      <sub>Kind Of Blue - Miles Davis</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/21029242.jpeg" width="200" alt="Labor Days"/><br/>
      <sub>Labor Days - Aesop Rock</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/377554.jpeg" width="200" alt="Let It Be"/><br/>
      <sub>Let It Be - The Beatles</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/443148.jpeg" width="200" alt="Let It Bleed"/><br/>
      <sub>Let It Bleed - The Rolling Stones</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2744901.jpeg" width="200" alt="Let It Sway"/><br/>
      <sub>Let It Sway - Someone Still Loves You Boris Yeltsin</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/13812915.jpeg" width="200" alt="'Let's Rock'"/><br/>
      <sub>'Let's Rock' - The Black Keys</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6641236.jpeg" width="200" alt="Let The Good Times Roll"/><br/>
      <sub>Let The Good Times Roll - JD McPherson</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/25568572.jpeg" width="200" alt="“Limited Edition” - Vol. 1 & Vol. 2"/><br/>
      <sub>“Limited Edition” - Vol. 1 & Vol. 2 - Sadgirl</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/3236115.jpeg" width="200" alt="Little Toot"/><br/>
      <sub>Little Toot - Don Wilson (4)</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/13485627.jpeg" width="200" alt="Live At Easy Street"/><br/>
      <sub>Live At Easy Street - Pearl Jam</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/33676644.jpeg" width="200" alt="Live At KEXP"/><br/>
      <sub>Live At KEXP - Frankie And The Witch Fingers</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/20210761.jpeg" width="200" alt="Live From Fort Adams"/><br/>
      <sub>Live From Fort Adams - Deer Tick</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/33667446.jpeg" width="200" alt="Live Houston Music Theatre '67"/><br/>
      <sub>Live Houston Music Theatre '67 - 13th Floor Elevators</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/723002.jpeg" width="200" alt="Live In Las Vegas"/><br/>
      <sub>Live In Las Vegas - Tom Jones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1224660.jpeg" width="200" alt="Love You Live"/><br/>
      <sub>Love You Live - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/242785.jpeg" width="200" alt="Madvillainy"/><br/>
      <sub>Madvillainy - MF Doom</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1574307.jpeg" width="200" alt="Magic Christian Music"/><br/>
      <sub>Magic Christian Music - Badfinger</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1779487.jpeg" width="200" alt="Magic Potion"/><br/>
      <sub>Magic Potion - The Black Keys</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6019037.jpeg" width="200" alt="Manipulator"/><br/>
      <sub>Manipulator - Ty Segall</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/10174618.jpeg" width="200" alt="Marcy Playground"/><br/>
      <sub>Marcy Playground - Marcy Playground</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/13145359.jpeg" width="200" alt="Mayonnaise"/><br/>
      <sub>Mayonnaise - Deer Tick</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6963285.jpeg" width="200" alt="MCIII"/><br/>
      <sub>MCIII - Mikal Cronin</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1766802.jpeg" width="200" alt="Memories"/><br/>
      <sub>Memories - Barbra Streisand</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/19923829.jpeg" width="200" alt="Midnight Blue"/><br/>
      <sub>Midnight Blue - Kenny Burrell</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4666796.jpeg" width="200" alt="Modern Vampires Of The City"/><br/>
      <sub>Modern Vampires Of The City - Vampire Weekend</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/34497226.jpeg" width="200" alt="Moisturizer"/><br/>
      <sub>Moisturizer - Wet Leg</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4228036.jpeg" width="200" alt="Morning View"/><br/>
      <sub>Morning View - Incubus (2)</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/19790008.jpeg" width="200" alt="(Moving)"/><br/>
      <sub>(Moving) - Peter, Paul & Mary</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/16533159.jpeg" width="200" alt="Music From And Inspired By Disney Pixar &quot;Soul&quot;"/><br/>
      <sub>Music From And Inspired By Disney Pixar "Soul" - Jon Batiste</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/11915831.jpeg" width="200" alt="My Baby Just Cares For Me"/><br/>
      <sub>My Baby Just Cares For Me - Nina Simone</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/14957811.jpeg" width="200" alt="My Baby Just Cares For Me"/><br/>
      <sub>My Baby Just Cares For Me - Nina Simone</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/8971083.jpeg" width="200" alt="My Woman"/><br/>
      <sub>My Woman - Angel Olsen</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4929194.jpeg" width="200" alt="Negativity"/><br/>
      <sub>Negativity - Deer Tick</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/9120695.jpeg" width="200" alt="Never Twice "/><br/>
      <sub>Never Twice  - Nick Waterhouse (2)</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2681475.jpeg" width="200" alt="No Time For Dreaming"/><br/>
      <sub>No Time For Dreaming - Charles Bradley</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/9436179.jpeg" width="200" alt="Odelay"/><br/>
      <sub>Odelay - Beck</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/400097.jpeg" width="200" alt="Oh, Inverted World"/><br/>
      <sub>Oh, Inverted World - The Shins</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/19288888.jpeg" width="200" alt="Our Endless Numbered Days"/><br/>
      <sub>Our Endless Numbered Days - Iron And Wine</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/33674250.jpeg" width="200" alt="Out Of Our Heads"/><br/>
      <sub>Out Of Our Heads - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/8572856.jpeg" width="200" alt="Out Of The Blue"/><br/>
      <sub>Out Of The Blue - Electric Light Orchestra</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6875270.jpeg" width="200" alt="Painted Shut"/><br/>
      <sub>Painted Shut - Hop Along</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6047722.jpeg" width="200" alt="Paul Desmond"/><br/>
      <sub>Paul Desmond - Paul Desmond</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/8363317.jpeg" width="200" alt="Peace, Love & Death Metal"/><br/>
      <sub>Peace, Love & Death Metal - Eagles Of Death Metal</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2379457.jpeg" width="200" alt="Perch Patchwork"/><br/>
      <sub>Perch Patchwork - Maps And Atlases</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/30026881.jpeg" width="200" alt="Playing Favorites"/><br/>
      <sub>Playing Favorites - Sheer Mag</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/26237564.jpeg" width="200" alt="Prime"/><br/>
      <sub>Prime - Christian McBride's New Jawn</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/18089446.jpeg" width="200" alt="Promenade Blue"/><br/>
      <sub>Promenade Blue - Nick Waterhouse (2)</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/9216088.jpeg" width="200" alt="Random Access Memories"/><br/>
      <sub>Random Access Memories - Daft Punk</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/3234844.jpeg" width="200" alt="Raw Delta Blues"/><br/>
      <sub>Raw Delta Blues - Son House</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/20190169.jpeg" width="200" alt="Reverberation"/><br/>
      <sub>Reverberation - The Queers</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6173840.jpeg" width="200" alt="Rock And Roll Night Club"/><br/>
      <sub>Rock And Roll Night Club - Mac Demarco</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/10949522.jpeg" width="200" alt="'Round About Midnight"/><br/>
      <sub>'Round About Midnight - Miles Davis</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1414854.jpeg" width="200" alt="Rubber Factory"/><br/>
      <sub>Rubber Factory - The Black Keys</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/7080660.jpeg" width="200" alt="Run The Jewels"/><br/>
      <sub>Run The Jewels - Run The Jewels</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6653718.jpeg" width="200" alt="Run The Jewels 2"/><br/>
      <sub>Run The Jewels 2 - Run The Jewels</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/23842250.jpeg" width="200" alt="Run The Jewels 4"/><br/>
      <sub>Run The Jewels 4 - Run The Jewels</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/944143.jpeg" width="200" alt="Rust Never Sleeps"/><br/>
      <sub>Rust Never Sleeps - Neil Young</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6131666.jpeg" width="200" alt="Sadnecessary"/><br/>
      <sub>Sadnecessary - Milky Chance</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/5552990.jpeg" width="200" alt="Salad Days"/><br/>
      <sub>Salad Days - Mac Demarco</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/12698907.jpeg" width="200" alt="Scenery"/><br/>
      <sub>Scenery - Ryo Fukui</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1711803.jpeg" width="200" alt="Scramble"/><br/>
      <sub>Scramble - The Coathangers</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/3303574.jpeg" width="200" alt="Sings &quot;A Night In The Caribbean&quot;"/><br/>
      <sub>Sings "A Night In The Caribbean" - Richie Delamore</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2843706.jpeg" width="200" alt="Smooth Sailing"/><br/>
      <sub>Smooth Sailing - Ella Fitzgerald</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/5554961.jpeg" width="200" alt="Solo Monk"/><br/>
      <sub>Solo Monk - Thelonious Monk</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/412446.jpeg" width="200" alt="Some Girls"/><br/>
      <sub>Some Girls - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/3799216.jpeg" width="200" alt="Somethin' Else"/><br/>
      <sub>Somethin' Else - Cannonball Adderley</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/6808830.jpeg" width="200" alt="Sometimes I Sit And Think, And Sometimes I Just Sit"/><br/>
      <sub>Sometimes I Sit And Think, And Sometimes I Just Sit - Courtney Barnett</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1843683.jpeg" width="200" alt="Star Wars / A Stereo Space Odyssey"/><br/>
      <sub>Star Wars / A Stereo Space Odyssey - John Williams (4)</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/15527143.jpeg" width="200" alt="Steel Wheels"/><br/>
      <sub>Steel Wheels - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/7084781.jpeg" width="200" alt="Sticky Fingers"/><br/>
      <sub>Sticky Fingers - The Rolling Stones</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2686987.jpeg" width="200" alt="Street Machine"/><br/>
      <sub>Street Machine - Sammy Hagar</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/5564792.jpeg" width="200" alt="Sweet Disarray"/><br/>
      <sub>Sweet Disarray - Dan Croll</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/12488257.jpeg" width="200" alt="Sweet Oblivion"/><br/>
      <sub>Sweet Oblivion - Screaming Trees</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/387851.jpeg" width="200" alt="Tapestry"/><br/>
      <sub>Tapestry - Carole King</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/468054.jpeg" width="200" alt="Tattoo You"/><br/>
      <sub>Tattoo You - The Rolling Stones</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/26227589.jpeg" width="200" alt="The Bad Plus."/><br/>
      <sub>The Bad Plus. - The Bad Plus</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1626912.jpeg" width="200" alt="The Best Of Eddy Arnold"/><br/>
      <sub>The Best Of Eddy Arnold - Eddy Arnold</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/963568.jpeg" width="200" alt="The Best Of Sam Cooke"/><br/>
      <sub>The Best Of Sam Cooke - Sam Cooke</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/7043223.jpeg" width="200" alt="The Big Come Up"/><br/>
      <sub>The Big Come Up - The Black Keys</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/28180618.jpeg" width="200" alt="The Black Dirt Sessions"/><br/>
      <sub>The Black Dirt Sessions - Deer Tick</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/33984606.jpeg" width="200" alt="The Chats EP"/><br/>
      <sub>The Chats EP - The Chats (2)</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/367104.jpeg" width="200" alt="The Dark Side Of The Moon"/><br/>
      <sub>The Dark Side Of The Moon - Pink Floyd</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/5601696.jpeg" width="200" alt="The Double EP: A Sea Of Split Peas"/><br/>
      <sub>The Double EP: A Sea Of Split Peas - Courtney Barnett</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/23301983.jpeg" width="200" alt="Their Ultimate Collection"/><br/>
      <sub>Their Ultimate Collection - Daryl Hall & John Oates</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/30115127.jpeg" width="200" alt="The Messthetics And James Brandon Lewis "/><br/>
      <sub>The Messthetics And James Brandon Lewis  - The Messthetics</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/990950.jpeg" width="200" alt="The Ozark Mountain Daredevils"/><br/>
      <sub>The Ozark Mountain Daredevils - The Ozark Mountain Daredevils</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/22384345.jpeg" width="200" alt="The Piper At The Gates Of Dawn"/><br/>
      <sub>The Piper At The Gates Of Dawn - Pink Floyd</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/3564656.jpeg" width="200" alt="The Queen Is Dead"/><br/>
      <sub>The Queen Is Dead - The Smiths</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/28365832.jpeg" width="200" alt="The Rise And Fall Of A Midwest Princess"/><br/>
      <sub>The Rise And Fall Of A Midwest Princess - Chappell Roan</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/8162188.jpeg" width="200" alt="The Rise And Fall Of Ziggy Stardust And The Spiders From Mars"/><br/>
      <sub>The Rise And Fall Of Ziggy Stardust And The Spiders From Mars - David Bowie</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/3126020.jpeg" width="200" alt="The Singing Nun"/><br/>
      <sub>The Singing Nun - Soeur Sourire</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/26535725.jpeg" width="200" alt="The Sophtware Slump"/><br/>
      <sub>The Sophtware Slump - Grandaddy</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/26740190.jpeg" width="200" alt="The Way I See It"/><br/>
      <sub>The Way I See It - Raphael Saadiq</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/918621.jpeg" width="200" alt="Thick As A Brick"/><br/>
      <sub>Thick As A Brick - Jethro Tull</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2981783.jpeg" width="200" alt="Thickfreakness"/><br/>
      <sub>Thickfreakness - The Black Keys</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2685808.jpeg" width="200" alt="This Is Glenn Miller"/><br/>
      <sub>This Is Glenn Miller - Glenn Miller And His Orchestra</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/10022995.jpeg" width="200" alt="This Old Dog"/><br/>
      <sub>This Old Dog - Mac Demarco</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/10844247.jpeg" width="200" alt="Time Out"/><br/>
      <sub>Time Out - The Dave Brubeck Quartet</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4123997.jpeg" width="200" alt="Time's All Gone"/><br/>
      <sub>Time's All Gone - Nick Waterhouse (2)</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/402897.jpeg" width="200" alt="Tommy"/><br/>
      <sub>Tommy - The Who</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2131760.jpeg" width="200" alt="Twenty Greatest Hits"/><br/>
      <sub>Twenty Greatest Hits - Kenny Rogers</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/23410463.jpeg" width="200" alt="Undercurrent"/><br/>
      <sub>Undercurrent - Bill Evans</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/17800651.jpeg" width="200" alt="Violent Femmes"/><br/>
      <sub>Violent Femmes - Violent Femmes</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/10717677.jpeg" width="200" alt="Vol. 1"/><br/>
      <sub>Vol. 1 - Deer Tick</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/31203541.jpeg" width="200" alt="Vol.1"/><br/>
      <sub>Vol.1 - Angine De Poitrine</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/10717712.jpeg" width="200" alt="Vol. 2"/><br/>
      <sub>Vol. 2 - Deer Tick</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/37334592.jpeg" width="200" alt="Vol. II"/><br/>
      <sub>Vol. II - Angine De Poitrine</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1649633.jpeg" width="200" alt="War Elephant"/><br/>
      <sub>War Elephant - Deer Tick</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/15878365.jpeg" width="200" alt="Water"/><br/>
      <sub>Water - Sadgirl</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/7133403.jpeg" width="200" alt="Waves"/><br/>
      <sub>Waves - Charles Lloyd</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/15980871.jpeg" width="200" alt="Weezer"/><br/>
      <sub>Weezer - Weezer</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/23616278.jpeg" width="200" alt="Wet Leg"/><br/>
      <sub>Wet Leg - Wet Leg</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1768826.jpeg" width="200" alt="Whatever Tickles Your Fancy"/><br/>
      <sub>Whatever Tickles Your Fancy - Christy Moore</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/1694416.jpeg" width="200" alt="What's For Dinner?"/><br/>
      <sub>What's For Dinner? - The King Khan & BBQ Show</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/20701471.jpeg" width="200" alt="White Blood Cells"/><br/>
      <sub>White Blood Cells - The White Stripes</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/3354750.jpeg" width="200" alt="Wish You Were Here"/><br/>
      <sub>Wish You Were Here - Pink Floyd</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/2985227.jpeg" width="200" alt="Within And Without"/><br/>
      <sub>Within And Without - Washed Out</sub>
    </td>
    <td width="33%" align="center" valign="top">
      <img src="https://bwrsabjywxnrvorxoizc.supabase.co/storage/v1/object/public/record-images/covers/4535648.jpeg" width="200" alt="Workingman's Dead"/><br/>
      <sub>Workingman's Dead - The Grateful Dead</sub>
    </td>
  </tr>
</tbody>
</table>
