import { formatInTimeZone } from "date-fns-tz";
import type { Config } from "../config.js";
import type { Holiday, SeasonDoc } from "../core/load.js";
import { resolveYear, type ResolvedHoliday } from "../core/resolve.js";
import { CATEGORIES, SEASONS, type Season } from "../core/schema.js";
import { CATEGORY_LABELS, SEASON_LABELS, formatDate, parseSections } from "./util.js";
import { marked } from "marked";
import { styles } from "./styles.js";

type SeasonMap = Map<Season, SeasonDoc>;

marked.use({ breaks: true, gfm: true });

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const paras = (s: string) =>
  s
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p.trim())}</p>`)
    .join("");

/** Render a reading as Markdown (blockquotes, links, emphasis). Content is trusted. */
function readingHtml(reading: string): string {
  return `<div class="reading">${marked.parse(reading) as string}</div>`;
}

/** The Meaning/Observance/Reading body — date-independent, so it's built once per holiday. */
function bodyHtmlFor(holiday: Holiday): string {
  const { meaning, observance, reading } = parseSections(holiday.body);
  return `<div class="body"><h4>Meaning</h4>${paras(meaning)}<h4>Observance</h4>${paras(observance)}<h4>Reading</h4>${readingHtml(reading)}</div>`;
}

function page(title: string, headExtra: string, bodyInner: string, bodyClass = ""): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>${styles}</style>
</head>
<body class="${bodyClass}">
<div class="wrap">
${bodyInner}
</div>
${headExtra}
</body>
</html>`;
}

function todayInTz(config: Config): { year: number } {
  return { year: Number(formatInTimeZone(new Date(), config.timezone, "yyyy")) };
}

// ─────────────────────────── Interactive website ───────────────────────────

/**
 * The dashboard is a small client-side app: all holidays for a span of years are
 * embedded as JSON, and the browser computes "today" (in the *viewer's* timezone),
 * lets you jump to any date, and filters by category or search. Because nothing is
 * baked to a build-time date, the site never goes stale between builds.
 */
export function renderSite(holidays: Holiday[], seasons: SeasonMap, config: Config): string {
  const base = todayInTz(config).year;
  const from = base - 2;
  const to = base + 8;

  const occ: { id: string; iso: string }[] = [];
  for (let y = from; y <= to; y++) {
    for (const r of resolveYear(holidays, y, config)) {
      const d = r.date;
      occ.push({ id: r.holiday.meta.id, iso: `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}` });
    }
  }
  occ.sort((a, b) => (a.iso < b.iso ? -1 : a.iso > b.iso ? 1 : 0));

  const ids = new Set(occ.map((o) => o.id));
  const h: Record<string, unknown> = {};
  for (const holiday of holidays) {
    const m = holiday.meta;
    if (!ids.has(m.id)) continue;
    h[m.id] = {
      title: m.title, category: m.category, season: m.season, region: m.region,
      tone: m.tone, tags: m.tags, blurb: m.blurb, durationDays: m.durationDays,
      body: bodyHtmlFor(holiday),
    };
  }

  const presentCats = CATEGORIES.filter((c) => [...ids].some((id) => (h[id] as { category: string }).category === c));
  const categories: Record<string, string> = {};
  for (const c of presentCats) categories[c] = CATEGORY_LABELS[c];

  const seasonsArr = SEASONS.map((s) => {
    const doc = seasons.get(s);
    return doc ? { season: s, title: doc.meta.title, blurb: doc.meta.blurb, body: doc.body ? paras(doc.body) : "" } : null;
  }).filter(Boolean);

  const data = {
    familyName: config.familyName,
    categories,
    seasonLabels: SEASON_LABELS,
    seasons: seasonsArr,
    range: { from, to },
    h,
    occ,
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  const webcal = config.siteUrl.replace(/^https?:\/\//, "webcal://") + "/calendar.ics";
  const inner = `
<header class="masthead">
  <h1>The Family Calendar</h1>
  <div class="subscribe">
    <a class="subscribe-primary" href="${webcal}">📆 Subscribe on your phone</a>
    <a href="calendar.ics">Download .ics</a>
    <a href="calendar.pdf">Printable PDF</a>
  </div>
</header>

<section class="controls">
  <input type="search" id="search" placeholder="Search by name, theme, or tag…" aria-label="Search holidays">
  <div class="chips" id="chips"></div>
  <div class="date-nav">
    <button data-unit="year" data-dir="-1" title="Previous year" aria-label="Previous year">&lt;&lt;&lt;</button>
    <button data-unit="month" data-dir="-1" title="Previous month" aria-label="Previous month">&lt;&lt;</button>
    <button data-unit="day" data-dir="-1" title="Previous day" aria-label="Previous day">&lt;</button>
    <input type="date" id="asof" aria-label="Show this date">
    <button data-unit="day" data-dir="1" title="Next day" aria-label="Next day">&gt;</button>
    <button data-unit="month" data-dir="1" title="Next month" aria-label="Next month">&gt;&gt;</button>
    <button data-unit="year" data-dir="1" title="Next year" aria-label="Next year">&gt;&gt;&gt;</button>
    <button id="todayBtn">Today</button>
  </div>
</section>

<section class="heatmap-sec">
  <div class="heatmap-head">
    <h3>Browse by date</h3>
    <span class="hlegend">Fewer <i class="lv0"></i><i class="lv1"></i><i class="lv2"></i><i class="lv3"></i> More</span>
  </div>
  <div class="heatmap-wrap"><div id="heatmap"></div></div>
</section>

<noscript><p class="empty-note">This dashboard needs JavaScript. Or grab the <a href="calendar.ics">.ics</a> / <a href="calendar.pdf">PDF</a>.</p></noscript>
<section id="feature"></section>
<section id="upcoming" class="upcoming"></section>
<div id="year"></div>
<footer>Explore any date · data spans ${from}–${to} · one source, three outputs (site · .ics · PDF)</footer>`;

  const scripts = `<script>window.__CAL__=${json};</script>\n<script>${APP_JS}</script>`;
  return page(`The Family Calendar`, scripts, inner);
}

/** Inline client app. Vanilla JS, no deps; string-concatenation only (no template literals). */
const APP_JS = `(function(){
  var D=window.__CAL__;
  var MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
  var WD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var SEASONS=["winter","spring","summer","autumn"];
  var pad=function(n){return (n<10?"0":"")+n;};
  var esc=function(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");};
  var toMs=function(iso){var p=iso.split("-");return Date.UTC(+p[0],+p[1]-1,+p[2]);};
  var fmt=function(iso,wy){var p=iso.split("-").map(Number);var dt=new Date(Date.UTC(p[0],p[1]-1,p[2]));return WD[dt.getUTCDay()]+", "+MONTHS[p[1]-1]+" "+p[2]+(wy?", "+p[0]:"");};
  var sfmt=function(iso){var p=iso.split("-").map(Number);return MONTHS[p[1]-1].slice(0,3)+" "+p[2];};
  var localToday=function(){var t=new Date();return t.getFullYear()+"-"+pad(t.getMonth()+1)+"-"+pad(t.getDate());};
  var shift=function(iso,unit,dir){var p=iso.split("-").map(Number),y=p[0],m=p[1]-1,d=p[2];
    if(unit==="day")return new Date(Date.UTC(y,m,d)+dir*864e5).toISOString().slice(0,10);
    if(unit==="month")m+=dir;else y+=dir;
    var ny=y+Math.floor(m/12),nm=((m%12)+12)%12,last=new Date(Date.UTC(ny,nm+1,0)).getUTCDate();
    return ny+"-"+pad(nm+1)+"-"+pad(Math.min(d,last));};
  var urlDate=function(){try{var d=(new URLSearchParams(location.search)).get("d");if(d&&/^\\d{4}-\\d{2}-\\d{2}$/.test(d))return d;}catch(e){}return null;};
  var state={date:localToday(),cats:new Set(Object.keys(D.categories)),q:""};
  var $=function(id){return document.getElementById(id);};

  var activeOn=function(iso){var t=toMs(iso);return D.occ.filter(function(o){var s=toMs(o.iso);var dur=D.h[o.id].durationDays||1;return t>=s&&t<s+dur*864e5;});};
  var after=function(iso,n){var t=toMs(iso),r=[];for(var i=0;i<D.occ.length;i++){var o=D.occ[i];if(toMs(o.iso)>t&&pass(o.id)){r.push(o);if(r.length>=n)break;}}return r;};
  var pass=function(id){var hh=D.h[id];if(!state.cats.has(hh.category))return false;if(state.q){var q=state.q.toLowerCase();var hay=(hh.title+" "+hh.blurb+" "+(hh.tags||[]).join(" ")+" "+D.categories[hh.category]).toLowerCase();if(hay.indexOf(q)<0)return false;}return true;};

  var card=function(o,open){var hh=D.h[o.id];return '\\n<details class="card '+hh.category+'"'+(open?" open":"")+'><summary><div class="head"><h3 class="title">'+esc(hh.title)+'</h3><div class="when">'+fmt(o.iso)+'</div></div><div class="badge">'+esc(D.categories[hh.category])+'</div><p class="blurb">'+esc(hh.blurb)+'</p></summary>'+hh.body+'</details>';};

  // "On this day" — each holiday active on the selected date gets its own (open) card.
  function renderDay(){
    var on=activeOn(state.date).filter(function(o){return pass(o.id);});on.sort(function(a,b){return((a.iso===state.date)?0:1)-((b.iso===state.date)?0:1);});
    var isToday=state.date===localToday(),el=$("feature");
    var head='<h2 class="dayhead">'+(isToday?"Today · ":"")+fmt(state.date,true)+(on.length>1?' · '+on.length+' observances':'')+'</h2>';
    if(on.length){
      el.innerHTML='<div class="onday">'+head+on.map(function(o){return card(o,false);}).join("")+'</div>';
    }else{var nx=after(state.date,1);
      el.innerHTML='<div class="onday empty">'+head+'<p class="empty-note">Nothing marked'+(isToday?" today":" on this day")+'.'+(nx.length?' Next: <strong>'+esc(D.h[nx[0].id].title)+'</strong>, '+fmt(nx[0].iso)+'.':'')+'</p></div>';
    }
  }
  // On the horizon — upcoming holidays within three months of the selected date.
  function renderUpcoming(){
    var end=shift(state.date,"month",3),up=[],el=$("upcoming");
    for(var i=0;i<D.occ.length;i++){var o=D.occ[i];if(o.iso>state.date&&o.iso<=end&&pass(o.id)){up.push(o);if(up.length>=8)break;}}
    el.innerHTML=up.length?'<h3>On the horizon <span class="hz-note">next 3 months</span></h3><ul>'+up.map(function(o){var hh=D.h[o.id];return '<li><button class="hz" data-d="'+o.iso+'"><span class="when">'+sfmt(o.iso)+'</span><span class="what"><strong>'+esc(hh.title)+'</strong><span class="dash"> — </span><span class="bl">'+esc(hh.blurb)+'</span></span></button></li>';}).join("")+'</ul>':'';
  }
  function renderYear(){
    var y=state.date.slice(0,4);
    var occ=D.occ.filter(function(o){return o.iso.slice(0,4)===y&&pass(o.id);});
    var html='<div class="yearhead"><h2>'+y+'</h2><span class="count">'+occ.length+' shown</span></div>';
    SEASONS.forEach(function(s){
      var list=occ.filter(function(o){return D.h[o.id].season===s;});if(!list.length)return;
      var sd=null;for(var i=0;i<D.seasons.length;i++){if(D.seasons[i].season===s){sd=D.seasons[i];break;}}
      var theme=sd?'<p class="season-theme">'+esc(sd.title)+'</p><p class="season-essence">'+esc(sd.blurb)+'</p>'+(sd.body?'<div class="season-intro">'+sd.body+'</div>':''):'';
      html+='<section class="season '+s+'"><h2>'+D.seasonLabels[s]+'</h2>'+theme+list.map(function(o){return card(o,false);}).join("")+'</section>';
    });
    if(!occ.length)html+='<p class="empty-note">No holidays match your filters in '+y+'.</p>';
    $("year").innerHTML=html;
  }
  // Heatmap for the selected year, split into twelve month blocks (weekday columns).
  function renderHeatmap(){
    var y=+state.date.slice(0,4),counts={};
    for(var i=0;i<D.occ.length;i++){var o=D.occ[i];if(o.iso.slice(0,4)===String(y)&&pass(o.id))counts[o.iso]=(counts[o.iso]||0)+1;}
    var html="";
    for(var m=0;m<12;m++){
      var first=Date.UTC(y,m,1),days=new Date(Date.UTC(y,m+1,0)).getUTCDate(),sd=new Date(first).getUTCDay(),cells="",p,d;
      for(p=0;p<sd;p++)cells+='<span class="hcell pad"></span>';
      for(d=1;d<=days;d++){
        var iso=y+"-"+pad(m+1)+"-"+pad(d),c=counts[iso]||0,lv=c===0?0:c===1?1:c===2?2:3;
        cells+='<button class="hcell lv'+lv+(iso===state.date?" sel":"")+'" data-d="'+iso+'" title="'+fmt(iso)+' \\u2014 '+c+' holiday'+(c===1?"":"s")+'"></button>';
      }
      html+='<div class="hmonth"><div class="hmlabel">'+MONTHS[m].slice(0,3)+'</div><div class="hmgrid">'+cells+'</div></div>';
    }
    $("heatmap").innerHTML=html;
  }
  function renderChips(){
    $("chips").innerHTML=Object.keys(D.categories).map(function(c){return '<button class="chip'+(state.cats.has(c)?" on":"")+'" data-cat="'+c+'">'+esc(D.categories[c])+'</button>';}).join("")+'<button class="chip util" data-all="1">All</button><button class="chip util" data-none="1">None</button>';
  }
  function refresh(){renderHeatmap();renderDay();renderUpcoming();renderYear();}
  function setDate(iso){state.date=iso;$("asof").value=iso;try{history.replaceState(null,"",location.pathname+"?d="+iso);}catch(e){}refresh();}

  document.addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b)return;
    if(b.dataset.cat){state.cats.has(b.dataset.cat)?state.cats.delete(b.dataset.cat):state.cats.add(b.dataset.cat);renderChips();refresh();}
    else if(b.dataset.all){state.cats=new Set(Object.keys(D.categories));renderChips();refresh();}
    else if(b.dataset.none){state.cats=new Set();renderChips();refresh();}
    else if(b.dataset.unit){setDate(shift(state.date,b.dataset.unit,+b.dataset.dir));}
    else if(b.dataset.d){setDate(b.dataset.d);}
    else if(b.id==="todayBtn"){setDate(localToday());}
  });
  $("asof").addEventListener("change",function(e){if(e.target.value)setDate(e.target.value);});
  $("search").addEventListener("input",function(e){state.q=e.target.value.trim();refresh();});

  state.date=urlDate()||localToday();$("asof").value=state.date;renderChips();refresh();
})();`;

// ─────────────────────────── Print / PDF (server-rendered) ──────────────────

function renderCardPrint(r: ResolvedHoliday): string {
  const m = r.holiday.meta;
  return `<article class="card ${m.category}">
    <div class="head"><h3 class="title">${esc(m.title)}</h3><div class="when">${formatDate(r)}</div></div>
    <div class="badge">${esc(CATEGORY_LABELS[m.category])}</div>
    <p class="blurb">${esc(m.blurb)}</p>
    <div class="body-wrap">${bodyHtmlFor(r.holiday)}</div>
  </article>`;
}

function seasonSectionsPrint(resolved: ResolvedHoliday[], seasons: SeasonMap): string {
  return SEASONS.map((season) => {
    const inSeason = resolved.filter((r) => r.holiday.meta.season === season);
    if (inSeason.length === 0) return "";
    const doc = seasons.get(season);
    const theme = doc
      ? `<p class="season-theme">${esc(doc.meta.title)}</p>
         <p class="season-essence">${esc(doc.meta.blurb)}</p>
         ${doc.body ? `<div class="season-intro">${paras(doc.body)}</div>` : ""}`
      : "";
    return `<section class="season ${season}"><h2>${SEASON_LABELS[season]}</h2>${theme}${inSeason.map(renderCardPrint).join("\n")}</section>`;
  }).join("\n");
}

/** The print/PDF layout: the full year for the current build year, everything expanded. */
export function renderPrint(holidays: Holiday[], seasons: SeasonMap, config: Config): string {
  const { year } = todayInTz(config);
  const thisYear = resolveYear(holidays, year, config);
  const inner = `
<header class="masthead">
  <h1>The Family Calendar</h1>
  <p>A secular liturgical year · ${year}</p>
</header>
${seasonSectionsPrint(thisYear, seasons)}
<footer>The family liturgical calendar · ${year}</footer>`;
  return page(`The Family Calendar — ${year}`, "", inner, "print");
}
