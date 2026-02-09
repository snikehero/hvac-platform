// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { ScrollArea } from "@/components/ui/scroll-area";

// import type { HvacStatus } from "@/types/hvac-status";
// import AhuEventsSection from "@/pages/AhuDetailPage/AhuEventsSection";

// interface Props {
//   events: any[];
//   status?: HvacStatus;
// }

// export default function AhuEventsPanel({ events, status }: Props) {
//   return (
//     <Card className="h-full">
//       <CardHeader className="pb-2">
//         <CardTitle className="text-sm">Eventos recientes</CardTitle>
//       </CardHeader>

//       <CardContent className="h-full pt-0">
//         <Tabs defaultValue="events" className="h-full">
//           <TabsList className="mb-2">
//             <TabsTrigger value="events">Eventos</TabsTrigger>
//             <TabsTrigger value="alarms">Alarmas</TabsTrigger>
//           </TabsList>

//           <TabsContent value="events" className="h-full">
//             <ScrollArea className="h-65 pr-2">
//               <AhuEventsSection events={events} status={status} />
//             </ScrollArea>
//           </TabsContent>

//           <TabsContent value="alarms">
//             <div className="text-xs text-muted-foreground">Próximamente…</div>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// }
