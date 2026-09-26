import { SmoothScroll } from "./components/SmoothScroll";
import { Loader } from "./components/Loader";
import { Hud } from "./components/Hud";
import { Cursor } from "./components/Cursor";
import { Hero } from "./components/sections/Hero";
import { Manifesto } from "./components/sections/Manifesto";
import { Record } from "./components/sections/Record";
import { Profile } from "./components/sections/Profile";
import { Work } from "./components/sections/Work";
import { Method } from "./components/sections/Method";
import { Context } from "./components/sections/Context";
import { Lab } from "./components/sections/Lab";
import { Lineage } from "./components/sections/Lineage";
import { Harness } from "./components/sections/Harness";
import { Handshake } from "./components/sections/Handshake";

/** The portfolio as a motion reel: eleven scenes, one continuous scroll. */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Loader />
      <Hud />
      <Cursor />
      <div className="grain" aria-hidden />
      <main className="relative overflow-x-clip">
        <Hero />
        <Manifesto />
        <Record />
        <Profile />
        <Work />
        <Method />
        <Context />
        <Lab />
        <Lineage />
        <Harness />
        <Handshake />
      </main>
    </>
  );
}
