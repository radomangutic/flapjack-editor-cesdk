import { saveIpAdddressData } from "../../helpers/SaveIpAddress";
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image'
import { useState, useEffect } from "react";

export default function TvPreview() {
  const router = useRouter();
  const { slug } = router.query;
  const [currentImage, setCurrentImage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentImage(2);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  return (<>
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {currentImage !== 1 ? <Image
        alt=""
        src={`https://wmdpmyvxnuwqtdivtjij.supabase.co/storage/v1/object/public/tv_menu_links/${slug}`}
        layout="fill"
        objectFit="contain"
        priority={true}
        style={{ zIndex: 1 }}
      /> :
        <Image
          alt=""
          src="/tv-placeholder.svg"
          layout="fill"
          objectFit="cover"
          priority={true}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8P8/1PwAHaQLjl01DeAAAAABJRU5ErkJggg=="
          style={{ zIndex: 0 }}
        />
      }
    </div>
  </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {

  saveIpAdddressData(context)
  return {
    props: {
    },
  }
}