
import { Table, Tooltip, Popconfirm, Spin } from 'antd'
import {
  DeleteFilled,
  EditFilled
} from '@ant-design/icons'

export default function List (props) {
  const { list, loadingRecs } = props
  if (!list.length) {
    return (
      <div>No keywords yet</div>
    )
  }
  const data = list.map((d, i) => {
    return {
      ...d,
      index: i + 1
    }
  })
  const commonRender = (text) => {
    return (
      <Tooltip title={text}>
        <div>{text}</div>
      </Tooltip>
    )
  }
  const cols = [
    {
      title: 'I',
      dataIndex: 'index',
      key: 'index',
      width: 30
    },
    {
      title: commonRender('Keywords'),
      dataIndex: 'keywords',
      render: commonRender,
      ellipsis: {
        showTitle: false
      },
      key: 'keywords',
      sort: (a, b) => {
        return a > b ? 1 : -1
      }
    },
    {
      title: commonRender('Reply'),
      dataIndex: 'reply',
      render: commonRender,
      ellipsis: {
        showTitle: false
      },
      key: 'reply'
    },
    {
      title: 'Trigger count',
      dataIndex: 'count',
      // render: commonRender,
      // ellipsis: {
      //   showTitle: false
      // },
      sort: (a, b) => a - b,
      width: 100,
      key: 'count'
    },
    {
      title: 'Action',
      dataIndex: 'op',
      width: 60,
      // ellipsis: {
      //   showTitle: false
      // },
      key: 'op',
      render: (text, item) => {
        const loading = loadingRecs[item.id] || false
        console.log(
          'loading', loading
        )
        return (
          <Spin spinning={loading}>
            <EditFilled
              onClick={() => props.edit(item)}
              className='pointer'
            />
            <Popconfirm
              title='Delete it? Are you sure?'
              onConfirm={() => props.del(item)}
            >
              <DeleteFilled
                className='pointer mg1l'
              />
            </Popconfirm>
          </Spin>
        )
      }
    }
  ]
  return (
    <Table
      columns={cols}
      dataSource={data}
      bordered
    />
  )
}
