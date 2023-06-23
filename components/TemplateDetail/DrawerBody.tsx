import { Text, Badge, Group } from '@mantine/core'
import { ITemplateDetails } from '../../interfaces'
import Image from 'next/image'

const DrawerBody = ({ images }: { images: string[] }) => {
    return (
        <>
            <Group mt={6}>
                {
                    images.map((url, i) =>
                        <Image
                            alt={`Sample menu rendering no ${i}`}
                            key={i}
                            src={url}
                            width={432}
                            height={216}
                        />)
                }
            </Group>
        </>
    );
}

export default DrawerBody