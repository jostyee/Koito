import { Link } from "react-router";
import Image from "./primitives/Image";

interface Props {
  to: string;
  onClick: React.MouseEventHandler<HTMLAnchorElement>;
  img: string;
  imgSize?: number;
  text: string;
  subtext?: string;
}

function SearchResultItem(props: Props) {
  return (
    <Link
      to={props.to}
      className="px-3 py-2 flex gap-3 items-center hover:text-(--color-fg-secondary)"
      onClick={props.onClick}
    >
      <Image
        src={props.img}
        size={props.imgSize ? props.imgSize : 100}
        alt={props.text}
      />
      <div>
        {props.text}
        {props.subtext ? (
          <>
            <br />
            <span className="color-fg-secondary">{props.subtext}</span>
          </>
        ) : (
          ""
        )}
      </div>
    </Link>
  );
}

function SearchResultArtistItem(props: Props) {
  return (
    <Link
      to={props.to}
      className="flex gap-3 items-center w-fit"
      onClick={props.onClick}
    >
      <div className="relative">
        <img
          src={props.img}
          style={{
            borderRadius: "var(--border-radius)",
          }}
          width={150}
          height={150}
        />
        <div
          className="absolute inset-0 border"
          style={{
            // eased with https://larsenwork.com/easing-gradients/
            backgroundImage: `linear-gradient(to top,
            var(--color-bg-secondary) 0%,
            color-mix(in srgb, var(--color-bg-secondary) 99.4%, transparent) 2.9%,
            color-mix(in srgb, var(--color-bg-secondary) 97.4%, transparent) 6.2%,
            color-mix(in srgb, var(--color-bg-secondary) 92.6%, transparent) 10.5%,
            color-mix(in srgb, var(--color-bg-secondary) 84.4%, transparent) 15.5%,
            color-mix(in srgb, var(--color-bg-secondary) 70.8%, transparent) 21.1%,
            color-mix(in srgb, var(--color-bg-secondary) 57.8%, transparent) 27%,
            color-mix(in srgb, var(--color-bg-secondary) 42.2%, transparent) 33%,
            color-mix(in srgb, var(--color-bg-secondary) 29.2%, transparent) 38.9%,
            color-mix(in srgb, var(--color-bg-secondary) 15.6%, transparent) 44.5%,
            color-mix(in srgb, var(--color-bg-secondary) 7.4%, transparent) 49.5%,
            color-mix(in srgb, var(--color-bg-secondary) 2.6%, transparent) 53.8%,
            color-mix(in srgb, var(--color-bg-secondary) 0.6%, transparent) 57.1%,
            transparent 60%
            )`,
            borderRadius: "var(--border-radius)",
          }}
        />
        <div className="absolute bottom-3 left-3">
          <h5 className="text-xl font-semibold line-clamp-2">{props.text}</h5>
        </div>
      </div>
    </Link>
  );
}

export { SearchResultArtistItem, SearchResultItem };
