import {
  apiFetch,
  type PaginatedResponse,
  type Ranked,
  type Album,
} from "api/api";
import { useQuery } from "@tanstack/react-query";
import CardHeader from "./primitives/CardHeader";
import ArtistLinks from "./ArtistLinks";
import MediaItem from "./primitives/MediaItem";
import { Link } from "react-router";
import { TopCardSkeleton } from "./skeletons/TopCardSkeleton";

interface Props {
  period: string;
}

const getTopAlbums = (args: { limit: number; period: string; page: number }) =>
  apiFetch<PaginatedResponse<Ranked<Album>>>("/apis/web/v1/top/albums", args);

export default function TopAlbumsCard({ period }: Props) {
  const numItems = 5;

  const args = { limit: numItems, period: period, page: 0 };
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["top/albums", args],
    queryFn: () => getTopAlbums(args),
  });

  const header = "Top albums";

  if (isPending) {
    return <TopCardSkeleton header={header} numItems={numItems} />;
  } else if (isError) {
    return (
      <div className="w-[300px]">
        <CardHeader to={`/chart/top/albums?period=${period}`} isOffset>
          {header}
        </CardHeader>
        <p className="error">Error: {error.message}</p>
      </div>
    );
  }

  if (!data.items[0]) {
    return (
      <div className="w-[348px]">
        <CardHeader to={`/chart/top/albums?period=${period}`} isOffset>
          {header}
        </CardHeader>
        <p className="ml-6 mt-6">Nothing to show</p>
      </div>
    );
  }

  return (
    <div>
      <CardHeader to={`/chart/top/albums?period=${period}`} isOffset>
        {header}
      </CardHeader>
      <div className="max-w-[350px] card">
        <div className="relative">
          <img
            src={data.items[0]?.item.image?.xl}
            srcSet={`${data.items[0]?.item.image?.large} 640w, ${data.items[0]?.item.image?.xl} 1000w`}
            sizes="348px"
            style={{
              borderRadius: "var(--border-radius) var(--border-radius) 0 0",
            }}
            width={350}
            height={350}
            alt={data.items[0]?.item.title}
          />
          <div
            className="absolute inset-0 bg-linear-to-t"
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
              borderRadius: "var(--border-radius) var(--border-radius) 0 0",
            }}
          />
          <div className="absolute bottom-10 left-5">
            <Link to={`/album/${data.items[0].item.id}`}>
              <h5 className="text-3xl font-semibold">
                {data.items[0]?.item.title}
              </h5>
            </Link>
            <div>
              <ArtistLinks
                artists={
                  data.items[0]?.item.artists
                    ? [data.items[0]?.item.artists[0]]
                    : [{ id: 0, name: "Unknown Artist" }]
                }
              />
              <div className="color-fg-secondary">
                {data.items[0]?.item.listen_count} plays
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start">
          {data.items.slice(1).map((i) => (
            <div
              className="px-6 pb-6"
              key={`top_albums_card_${i.rank}_${i.item.title}`}
            >
              <MediaItem
                image={i.item.image}
                size="md"
                link={`/album/${i.item.id}`}
                title={i.item.title}
                alt={i.item.title}
                subtitle={<ArtistLinks artists={[i.item.artists[0]]} />}
                meta={`${i.item.listen_count} plays`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
