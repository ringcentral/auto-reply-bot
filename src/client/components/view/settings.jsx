import {
  Switch,
  Tooltip,
  Spin
} from 'antd'
import {
  QuestionCircleFilled
} from '@ant-design/icons'

export default (props) => {
  const {
    on,
    shouldUseSignature
  } = props.user || {}
  const tip = (
    <Tooltip
      title='When signature enbaled, people would know the message is from bot'
    >
      <QuestionCircleFilled />
    </Tooltip>
  )
  const sig1 = (
    <div>
      <span className='mg1r'>Signature enabled</span>
      {tip}
    </div>
  )
  const sig0 = (
    <div>
      <span className='mg1r'>Signature disabled</span>
      {tip}
    </div>
  )
  return (
    <Spin spinning={props.loading}>
      <div className='pd1b'>
        <Switch
          checked={!!on}
          onChange={props.onChangeOn}
          checkedChildren='Auto reply enabled'
          unCheckedChildren='Auto reply disabled'
        />
      </div>
      <div className='pd1b'>
        <Switch
          onChange={props.onChangeSig}
          checked={!!shouldUseSignature}
          checkedChildren={sig1}
          unCheckedChildren={sig0}
        />
      </div>
    </Spin>
  )
}
