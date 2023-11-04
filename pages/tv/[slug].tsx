export default function TvPreview({
  ip
}: {
  ip: string
}) {
  return <>
    <p>test: {ip}</p>
    {/* <img width="100%" src="https://wmdpmyvxnuwqtdivtjij.supabase.co/storage/v1/object/public/tv_menu_links/Boston%20Market%20Page%201.jpg" /> */}
  </>;
}
export async function getServerSideProps({ req }: any) {
  const forwarded = req.headers["x-forwarded-for"]
  const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress
  return {
    props: {
      ip,
    },
  }
}