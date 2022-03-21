import {
  Modal
} from 'antd'
import Form from './form'

export default function Edit (props) {
  const {
    onSubmit,
    onCancel,
    rec
  } = props
  if (!rec) {
    return null
  }
  function submit (res) {
    return onSubmit(rec, res)
  }
  return (
    <Modal
      title='Edit keywords'
      footer={null}
      onCancel={onCancel}
      visible
    >
      <Form
        formData={rec}
        loading={props.loading}
        handleSubmit={submit}
      />
    </Modal>
  )
}
