import React, { useState } from 'react'
import { Layout, Row, Col, Avatar, Dropdown, Icon, Modal, Spin } from 'antd'
import { inject, observer } from 'mobx-react'

import DropMenu from './Header/DropMenu'
import RechargeModal from './Header/RechargeModal'
import CurrentBalance from './Header/CurrentBalance'
import Contact from '../login/Contact'

const { Header } = Layout
const nickname = sessionStorage.getItem('nickname')

const logoutModal = () => {
  Modal.confirm({
    title: '是否确认退出',
    onOk: async () => {
      sessionStorage.clear()
      window.location.href = '/'
    }
  })
}

const TopHeader = ({ global }) => {
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { globalConfig: { service } } = global
  
  const dropMenu = [
    { key: 'recharge', val: '充值', icon: 'dollar', callback: () => { setRechargeModalVisible(true) } },
    { key: 'logout', val: '退出登录', icon: 'logout', callback: () => { logoutModal() } }
  ]

  return (
    <Header style={{ background: '#fff' }} id="header">
      <Spin spinning={loading}>
        <Row type="flex" justify="end" align="middle">
          <Col>
            <Contact service={service} layout="inline" refresh />
          </Col>

          <Col>
            <CurrentBalance loadingHandler={setLoading} />
          </Col>

          <Col offset={1}>
            <Dropdown overlay={DropMenu(dropMenu)} getPopupContainer={() => document.querySelector('#header')} className="header-drop">
              <div className="simulationA">
                <Avatar shape="square" src="/images/avatar.jpg" />
                <span style={{ margin: '0 15px' }}>{nickname}</span>
                <Icon type="down" />
              </div>
            </Dropdown>
          </Col>
        </Row>
      </Spin>

      <RechargeModal visible={rechargeModalVisible} onCancel={setRechargeModalVisible} />
    </Header>
  )
}

export default inject('global')(observer(TopHeader))