import type { Metadata } from "next";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import ComponentsDemo from "../_demo";
import { DEMO_COMPONENT_NAMES, DEMO_LISTS, demoId } from "../_components";

type Params = Promise<{ id: string }>;

const nameOf = (id: string) =>
  DEMO_COMPONENT_NAMES.find((name) => demoId(name) === id) ??
  DEMO_LISTS.find((list) => list.id === id)?.name;

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  const name = nameOf((await params).id);
  return { title: name ? `${name} - Componenten` : "Componenten" };
};

const ComponentPage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  const name = nameOf(id);
  return (
    <>
      {name && <HuidigeKruimel pad={`/demo/${id}`} label={name} />}
      <ComponentsDemo id={id} />
    </>
  );
};

export default ComponentPage;
