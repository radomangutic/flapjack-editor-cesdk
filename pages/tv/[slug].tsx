import { saveIpAdddressData } from "../../helpers/SaveIpAddress";
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image'

export default function TvPreview() {
  const router = useRouter();
  const { slug } = router.query;
  return <div style={{ position: "relative", height: "100%", width: "100%" }}>
    <Image
      alt="Tv menu image"
      src={`https://wmdpmyvxnuwqtdivtjij.supabase.co/storage/v1/object/public/tv_menu_links/${slug}`}
      layout="fill"
      objectFit="contain"
      priority={true}
    />
  </div>;
}
export async function getServerSideProps(context: GetServerSidePropsContext) {

  saveIpAdddressData(context)
  return {
    props: {
    },
  }
}