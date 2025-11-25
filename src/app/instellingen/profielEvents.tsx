import Card from "@/components/Card";
import profielClient from "@/network/profiel";

const ProfielEvents = async ({ kvkNummer }: { kvkNummer: string }) => {
  const { data: auditLogs } = await profielClient.GET(
    "/auditlogs/{kvkNummer}",
    { params: { path: { kvkNummer: kvkNummer! } } },
  );

  return (
    <Card className="space-y-4">
      <h2 className="text-2xl">Geschiedenis</h2>
      <p>
        Hier ziet u wanneer u of iemand anders binnen uw organisatie de email
        instellingen heeft aangepast
      </p>

      <div>
        <div className="relative flex flex-col items-start">
          <div className="absolute top-0 left-2 h-full w-[2px] bg-gray-300"></div>

          {auditLogs?.OndernemingAuditLog?.map((event, index) => (
            <div key={index} className="relative mb-8 ml-6 flex items-start">
              <div className="absolute -left-[22px] flex h-4 w-4 items-center justify-center rounded-full bg-gray-400"></div>

              <div>
                <h3 className="text-sm font-semibold">
                  {event.field} {event.action} door {event.performedBy}
                </h3>
                <p className="text-xs text-gray-500">{event.performedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ProfielEvents;
