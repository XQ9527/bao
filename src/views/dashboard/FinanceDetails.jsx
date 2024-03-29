import React, { Component } from 'react'
import { Table, Form, Button, DatePicker } from 'antd'
import moment from 'moment'

import SelectForm from '../../components/form/SelectForm'

import fetch from '../../plugins/axios'
import { amountFixed } from '../../utils/numFixed'
import { timeParser, timeStamp } from '../../utils/timeTransform'

const { RangePicker } = DatePicker

const startTime = moment().startOf('day')
const endTime = moment().endOf('day')

const tableColumne = [
  { title: '类型', align: 'center', dataIndex: 'type', render: type => selectTypeConfig.find(e => +type === e.key).val || '-' },
  { title: '变动时间', align: 'center', dataIndex: 'change_time' },
  { title: '原余额', align: 'center', dataIndex: 'origin', render: amount => amountFixed(amount) },
  { title: '变动值', align: 'center', dataIndex: 'change', render: amount => amountFixed(amount) },
  { title: '变动后', align: 'center', dataIndex: 'newest', render: amount => amountFixed(amount) }
]

const selectTypeConfig = [
  { key: 0, val: '无' },
  { key: 1, val: '系统充值' },
  { key: 2, val: '充值赠送' },
  { key: 3, val: '管理扣除' },
  { key: 4, val: '下单消耗' },
  { key: 5, val: '系统退单' },
]

const selectOrderConfig = [
  { key: 1, val: '变动时间从大到小' },
  { key: 2, val: '变动时间从小到大' },
  { key: 3, val: '变动值从大到小' },
  { key: 4, val: '变动值从小到大' },
]

class FinanceDetails extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: [],
      loading: false,
      pagination: {
        current: 0,
        pageSize: 20,
        hideOnSinglePage: true
      }
    }
  }

  onChange = ({ current }) => {
    this.onSubmit('', current)
  }

  onSubmit = (e, page = 0) => {
    e && e.preventDefault()

    const { validateFields } = this.props.form
    validateFields(async (err, values) => {
      if (!err) {
        this.setState({ loading: true })
        try {
          const { timeRange } = values
          const start = timeStamp(timeRange[0])
          const end = timeStamp(timeRange[1])
          delete values.timeRange
          const { data, max, page: current } = await fetch('FKSelectGold', {
            ...values,
            start,
            end,
            page
          })
          const formatData = data.map((e, index) => {
            const type = e[0]
            const change_time = timeParser(e[1] * 1000)
            const origin = e[2]
            const change = e[3]
            const newest = e[4]
            return { type, change_time, origin, change, newest, index }
          })
          this.setState(state => {
            state.tableData = formatData
            state.pagination = {
              ...state.pagination,
              current,
              total: max * formatData.length,
              pageSize: formatData.length
            }
            return state
          })
        } catch (error) {
          console.log(error)
        } finally {
          this.setState({ loading: false })
        }
      }
    })
  }

  render() {
    const { loading, tableData, pagination } = this.state
    const { getFieldDecorator } = this.props.form

    return (
      <>
        <Form layout="inline" onSubmit={this.onSubmit}>
          <SelectForm
            model="type"
            label="明细类型"
            config={selectTypeConfig}
            getFieldDecorator={getFieldDecorator}
          />

          <SelectForm
            model="order"
            label="排序方式"
            config={selectOrderConfig}
            getFieldDecorator={getFieldDecorator}
          />

          <Form.Item label="变动时间">
            {getFieldDecorator('timeRange', { initialValue: [startTime, endTime] })(<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>查询</Button>
          </Form.Item>
        </Form>

        <Table
          dataSource={tableData}
          pagination={pagination}
          loading={loading}
          columns={tableColumne}
          rowKey="index"
          size="small"
          style={{ background: '#fff' }}
          onChange={this.onChange}
        />
      </>
    )
  }
}

export default Form.create({ name: 'finance_details' })(FinanceDetails)