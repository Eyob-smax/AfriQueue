import { notFound } from "next/navigation";
import Link from "next/link";
import { getHealthCenterById } from "@/lib/actions/health-center";
import type { HealthCenterWithQueues } from "@/lib/actions/queue";
import { ClinicsMap } from "@/components/dashboard/ClinicsMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

export default async function ClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const center = await getHealthCenterById(id);
  if (!center) notFound();

  const mapCenter: HealthCenterWithQueues = {
    id: center.id,
    name: center.name,
    city: center.city,
    address: center.address,
    latitude: center.latitude,
    longitude: center.longitude,
    status: center.status,
    queues: center.queues,
  };

  const operatingStatus = center.operating_status ?? "OPEN";
  const canJoinQueue = center.queue_availability !== false;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/client"
          className="flex items-center gap-2 text-[#4c9a93] hover:text-primary font-medium"
        >
          <MaterialIcon icon="arrow_back" size={20} />
          Back to dashboard
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
          {center.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-lg">
            {center.city}
          </Badge>
          <Badge
            variant={operatingStatus === "OPEN" ? "default" : "destructive"}
            className="rounded-lg"
          >
            {operatingStatus}
          </Badge>
          {center.specialties?.map((s) => (
            <Badge key={s} variant="outline" className="rounded-lg">
              {s}
            </Badge>
          ))}
        </div>
      </header>

      {center.description && (
        <section>
          <h2 className="text-lg font-semibold text-[#0d1b1a] dark:text-white mb-2">
            About
          </h2>
          <p className="text-muted-foreground">{center.description}</p>
        </section>
      )}

      {center.services && (
        <section>
          <h2 className="text-lg font-semibold text-[#0d1b1a] dark:text-white mb-2">
            Services
          </h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {center.services}
          </p>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-[#0d1b1a] dark:text-white mb-3">
          Queues
        </h2>
        {center.queues.length === 0 ? (
          <p className="text-muted-foreground">No active queues at the moment.</p>
        ) : (
          <ul className="space-y-2">
            {center.queues.map((q) => (
              <li
                key={q.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[#cfe7e5] dark:border-[#2d4d4a] bg-white dark:bg-[#1a3330]"
              >
                <div>
                  <span className="font-medium text-[#0d1b1a] dark:text-white">
                    {q.service_type ?? "General"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {q.queue_date
                      ? new Date(q.queue_date).toLocaleDateString()
                      : ""}{" "}
                    · {q.count} in queue
                  </span>
                </div>
                {canJoinQueue && (
                  <Link href="/dashboard/client">
                    <Button size="sm" className="rounded-lg">
                      Join queue
                    </Button>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {(center.latitude || center.address) && (
        <section>
          <h2 className="text-lg font-semibold text-[#0d1b1a] dark:text-white mb-3">
            Location
          </h2>
          {center.address && (
            <p className="text-muted-foreground mb-2">{center.address}</p>
          )}
          {center.latitude && center.longitude && (
            <div className="relative w-full h-[280px] rounded-xl overflow-hidden border border-[#cfe7e5] dark:border-[#2d4d4a]">
              <ClinicsMap
                centers={[mapCenter]}
                selectedId={center.id}
                userLat={parseFloat(center.latitude)}
                userLng={parseFloat(center.longitude)}
              />
            </div>
          )}
          {center.latitude && center.longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-primary hover:underline font-medium"
            >
              <MaterialIcon icon="directions" size={20} />
              Get directions
            </a>
          )}
        </section>
      )}
    </div>
  );
}
