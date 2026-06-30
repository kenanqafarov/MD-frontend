import { Select, Space } from 'antd'

const Filters = () => {
    return (
        <div>
            <Space wrap>
                <Select
                    style={{ width: 150 }}
                    options={[
                        { value: 'A-Group Sığorta', label: 'A-Group Sığorta' },
                        { value: 'B-Group Sığorta', label: 'B-Group Sığorta' },
                        { value: 'C-Group Sığorta', label: 'C-Group Sığorta' },

                    ]}
                    placeholder="Sığorta"

                />

                <Select
                    status={status}
                    style={{ width: 150 }}
                    options={[
                        { value: 'veziyyet', label: 'Vəziyyət' },
                        { value: 'plan', label: 'Plan' }
                    ]}
                    placeholder="Seç..."
                />
            </Space>
        </div>
    )
}

export default Filters
