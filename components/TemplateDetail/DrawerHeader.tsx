import { Text, Badge, Group } from '@mantine/core'
import { ITemplateDetails } from '../../interfaces'
import Image from 'next/image'

const DrawerHeader = ({ templateData }: { templateData: ITemplateDetails }) => {
    const { name, description, tags } = templateData
    return (
        <>
            <Text size={32} weight={200}>{name}</Text>
            <Text size="sm">{description}</Text>
            <Group mt={6}>
                {
                    tags?.map((tag: string, i: number) =>
                        <Badge key={i} color="gray" variant="filled">
                            {tag}
                        </Badge>)
                }
            </Group>
        </>
    );
}

export default DrawerHeader