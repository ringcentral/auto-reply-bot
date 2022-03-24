
import { Component } from 'react'
import {
  Tabs,
  Button,
  Typography,
  Spin,
  notification
} from 'antd'
import {
  getUser,
  listRecs,
  updateRec,
  createRec,
  delRec,
  updateUser
} from '../../common/apis'
import {
  GithubFilled,
  HighlightOutlined,
  LinkOutlined
} from '@ant-design/icons'
import copy from 'json-deep-copy'
import RecList from './list'
import Form from './form'
import Setting from './settings'
import Edit from './edit'

const { Text } = Typography
const { TabPane } = Tabs

export default class View extends Component {
  state = {
    loading: false,
    loadingRecords: false,
    userLoaded: false,
    user: null,
    loadingRecs: {},
    record: {
      keywords: '',
      reply: ''
    },
    editRec: null,
    records: [],
    recordsLoaded: false,
    tab: 'newRec' // or records
  }

  componentDidMount () {
    window.particleBg('#bg', {
      color: '#08c'
    })
    this.getRcUser()
  }

  getRcUser = async () => {
    this.setState({
      loading: true
    })
    const up = {
      userLoaded: true,
      loading: false
    }
    const user = await getUser()
    if (user) {
      up.user = user
    }
    this.setState(up, user ? this.afterGetUser : undefined)
  }

  afterGetUser = () => {
    this.checkUserOn()
    this.getRecs()
  }

  checkUserOn = () => {
    const {
      on,
      turnOffDesc = ''
    } = this.state.user || {}
    if (!on) {
      const re = turnOffDesc === 'self'
        ? 'You have turned auto reply off'
        : 'Token renew failed'
      notification.info({
        message: 'Auto reply disabled',
        duration: 55,
        description: (
          <div>
            <p>{re}</p>
            <p>
              <Button
                type='primary'
                onClick={() => this.handleChangeOn(true)}
              >
                Enable auto reply
              </Button>
            </p>
          </div>
        )
      })
    }
  }

  onSubmit = async (res) => {
    this.setState({
      loading: true
    })
    const r = await createRec({
      ...res,
      botId: window.rc.botId
    })
    const update = {
      loading: false
    }
    if (r) {
      const { user, records } = this.state
      update.user = {
        ...user,
        recIds: [
          ...(user.recIds || []),
          r.id
        ]
      }
      update.records = [
        ...records,
        r
      ]
    }
    this.setState(update)
    return r
  }

  getRecs = async () => {
    this.setState({
      loadingRecords: true
    })
    const up = {
      loadingRecords: false
    }
    const r = await listRecs()
    if (r) {
      up.records = r
    }
    this.setState(up)
  }

  createRec = async (res) => {
    this.setState({
      loading: true
    })
    const up = {
      loading: false
    }
    const rec = await createRec(res)
    if (rec) {
      up.records = [
        ...this.state.records,
        rec
      ]
    }
    this.setState(up)
    return rec
  }

  delRecAct = async (rec) => {
    const r = await delRec(rec.id)
    if (r) {
      this.setState(old => {
        return {
          user: {
            ...old.user,
            recIds: (old.user.recIds || []).filter(
              d => d !== rec.id
            )
          },
          records: old.records.filter(
            d => d.id !== rec.id
          )
        }
      })
    }
  }

  loadingRec = (rec, loading) => {
    this.setState(old => {
      return {
        loadingRecs: {
          ...old.loadingRecs,
          [rec.id]: loading
        }
      }
    })
  }

  delRec = async (rec) => {
    this.loadingRec(rec, true)
    await this.delRecAct(rec)
    this.loadingRec(rec, false)
  }

  doDelRec = (rec) => {
    this.delRec(rec)
  }

  editRec = rec => {
    this.setState({
      editRec: rec
    })
  }

  handleUpdateRec = async (rec, data) => {
    this.loadingRec(rec, true)
    this.setState({
      loading: true
    })
    const up = {
      editRec: null,
      loading: false
    }
    const r = await updateRec(rec.id, data)
    this.loadingRec(rec, false)
    this.setState(old => {
      if (r) {
        const recs = copy(old.records)
        const item = recs.find(r => r.id === rec.id)
        if (item) {
          Object.assign(item, data)
        }
        up.records = recs
      }
      return up
    })
  }

  handleTab = tab => {
    this.setState({
      tab
    })
  }

  handleLogout = () => {
    window.localStorage.removeItem(window.rc.jwtPrefix + ':rcpf-jwt-token')
    this.setState({
      user: null,
      records: []
    })
  }

  renderUrl = () => {
    return window.rc.loginUrl.replace(
      window.rc.defaultState,
      encodeURIComponent(window.location.href)
    )
  }

  renderLogin () {
    return (
      <div className='pd3 aligncenter'>
        <a
          href={this.renderUrl()}
        >
          <Button
            size='large'
            type='primary'
          >
            Authorize
          </Button>
        </a>
      </div>
    )
  }

  renderLoading () {
    return (
      <div className='pd3 aligncenter'>
        Loading...
      </div>
    )
  }

  renderFooter = () => {
    return (
      <div className='pd3y'>
        <h2>
          <img src='https://raw.githubusercontent.com/ringcentral/auto-reply-bot/master/imgs/logo.png' height={21} className='iblock mg1r' />
          <span className='iblock'>Auto reply bot for RingCentral app</span>
        </h2>
        <p>
          <a
            href={window.rc.feedbackUrl}
            target='_blank'
            rel='noreferrer'
          >
            <HighlightOutlined /> Feedback
          </a>
          <a
            className='mg1l'
            href='https://github.com/ringcentral/auto-reply-bot'
            target='_blank'
            rel='noreferrer'
          >
            <GithubFilled /> GitHub repo
          </a>
          <a
            className='mg1l'
            href='https://www.ringcentral.com/apps'
            target='_blank'
            rel='noreferrer'
          >
            <LinkOutlined /> RingCentral App gallery
          </a>
        </p>
        <div className='pd1y'>
          <Text type='secondary'>
            <div>
              <img src='//raw.githubusercontent.com/ringcentral/ringcentral-embeddable/master/src/assets/rc/icon.svg' className='iblock mg1r' alt='' />
              <span className='iblock bold pd1y'>RingCentral Labs</span>
            </div>
            <p>RingCentral Labs is a program that lets RingCentral engineers, platform product managers and other employees share RingCentral apps they've created with the customer community. RingCentral Labs apps are free to use, but are not official products, and should be considered community projects - these apps are not officially tested or documented. For help on any RingCentral Labs app please consult each project's GitHub Issues message boards - RingCentral support is not available for these applications.</p>
          </Text>
        </div>
      </div>
    )
  }

  renderHeader = () => {
    const {
      user
    } = this.state
    const {
      name,
      on,
      shouldUseSignature
    } = user || {}
    const nameStr = name
      ? (<span>Login as <b>{name}</b></span>)
      : null
    return (
      <div className='top alignright font12'>
        <Text type='secondary'>
          <span>{nameStr}</span>
          <span
            onClick={this.handleLogout}
            className='pointer link mg1l'
          >
            Logout
          </span>
          <span className='mg1l'>Reply: {on ? 'On' : 'Off'}</span>
          <span className='mg1l'>Signature: {shouldUseSignature ? 'On' : 'Off'}</span>
        </Text>
      </div>
    )
  }

  renderDetail = () => {
    const {
      loading,
      loadingRecs,
      editRec,
      records,
      loadingRecords
    } = this.state
    const loadingCurrentRec = editRec
      ? loadingRecs[editRec.id] || false
      : false
    return (
      <div>
        <div className='pd1b'>
          <Form
            formData={this.state.rec}
            loading={loading}
            handleSubmit={this.onSubmit}
          />
        </div>
        <div className='pd2y'>
          <Spin spinning={loadingRecords}>
            <h3>Keywords list ({records.length})</h3>
            <RecList
              list={records}
              edit={this.editRec}
              loadingRecs={loadingRecs}
              del={this.doDelRec}
            />
          </Spin>
        </div>
        <Edit
          onSubmit={this.handleUpdateRec}
          rec={editRec}
          onCancel={this.handleCancel}
          loading={loadingCurrentRec}
        />
      </div>
    )
  }

  parseUserUpdate = (update) => {
    const keys = Object.keys(update)
    return keys.reduce((p, k) => {
      return {
        ...p,
        [k]: update[k] ? 1 : 0
      }
    }, {})
  }

  updateUser = async update => {
    this.setState({
      loading: true
    })
    const up = {
      loading: false
    }
    const parsed = this.parseUserUpdate(update)
    const r = await updateUser(
      parsed
    )
    if (r) {
      up.user = {
        ...this.state.user,
        ...parsed
      }
    }
    this.setState(up)
  }

  handleChangeOn = on => {
    if (!on) {
      this.updateUser({
        turnOffDesc: 'self',
        on
      })
    } else {
      window.location.href = this.renderUrl()
    }
  }

  handleChangeSig = shouldUseSignature => {
    this.updateUser({
      shouldUseSignature
    })
  }

  renderSettings = () => {
    return (
      <Setting
        user={this.state.user}
        loading={this.state.loading}
        onChangeOn={this.handleChangeOn}
        onChangeSig={this.handleChangeSig}
      />
    )
  }

  renderContent = () => {
    const tabs = [
      {
        id: 'newRec',
        title: 'Config auto reply',
        func: this.renderDetail
      },
      {
        id: 'settings',
        title: 'Auto reply settings',
        func: this.renderSettings
      }
    ]
    return (
      <div className='wrap'>
        {this.renderHeader()}
        <div className='pd3y'>
          <Tabs
            activeKey={this.state.tab}
            onTabClick={this.handleTab}
          >
            {
              tabs.map(t => {
                const {
                  id, title, func
                } = t
                return (
                  <TabPane key={id} tab={title}>
                    {func()}
                  </TabPane>
                )
              })
            }
          </Tabs>
        </div>
        {this.renderFooter()}
      </div>
    )
  }

  render () {
    const {
      userLoaded,
      user
    } = this.state
    if (!userLoaded) {
      return this.renderLoading()
    } else if (!user) {
      return this.renderLogin()
    }
    return this.renderContent()
  }
}
