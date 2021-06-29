import React from 'react'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/lab/Alert'
import QRCode from 'qrcode.react'
import qrcodeParser from 'qrcode-parser'

const themeDic = {
  light: createMuiTheme({
    palette: {
      type: 'light'
    },
    props: {
      MuiButtonBase: {
        disableRipple: true
      }
    }
  }),
  dark: createMuiTheme({
    palette: {
      type: 'dark',
      primary: {
        main: '#90caf9'
      },
      secondary: {
        main: '#f48fb1'
      }
    },
    props: {
      MuiButtonBase: {
        disableRipple: true
      }
    }
  })
}

export default class App extends React.Component {
  state = {
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    value: '',
    openMessage: false,
    message: { key: 0, type: 'success', body: '' }
  }

  componentDidMount () {
    window.utools.onPluginEnter(({ code, type, payload }) => {
      document.getElementById('text-input').focus()
      if (type === 'regex') {
        this.setState({ value: payload })
        return
      }
      if (type === 'window') {
        this.setState({ value: window.utools.getCurrentBrowserUrl() || '' })
        return
      }
      if (type === 'img') {
        this.setState({ value: '' })
        qrcodeParser(payload)
          .then(result => {
            this.setState({ value: result.data, openMessage: true, message: { key: Date.now(), type: 'success', body: '已成功解码图片中二维码' } })
            setTimeout(() => { document.getElementById('text-input').select() })
          })
          .catch(() => {
            this.setState({ openMessage: true, message: { key: Date.now(), type: 'error', body: '无法识别图片中二维码' } })
          })
      }
    })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.setState({ theme: e.matches ? 'dark' : 'light' })
    })
  }

  handleInputChange = (event) => {
    this.setState({ value: event.target.value })
  }

  handleCopy = () => {
    window.utools.hideMainWindow()
    window.utools.copyImage(document.getElementById('qrcode').toDataURL('image/png'))
  }

  handleCloseMessage = () => {
    this.setState({ openMessage: false })
  }

  render () {
    const { theme, value, openMessage, message } = this.state
    return (
      <ThemeProvider theme={themeDic[theme]}>
        <div className='app-page'>
          <TextField
            label=''
            id='text-input'
            placeholder='输入文字内容或粘贴截图'
            autoFocus
            multiline
            rows={12}
            variant='filled'
            fullWidth
            onChange={this.handleInputChange}
            value={value}
          />
          <div>
            <Tooltip placement='top' title='点击复制二维码图片'>
              <Paper className='app-qrcode'>
                <QRCode id='qrcode' size={256} value={value} onClick={this.handleCopy} />
              </Paper>
            </Tooltip>
            <Snackbar
              key={message.key}
              open={openMessage}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              autoHideDuration={3000}
              onClose={this.handleCloseMessage}
            >
              <Alert onClose={this.handleCloseMessage} variant='filled' severity={message.type}>{message.body}</Alert>
            </Snackbar>
          </div>
        </div>
      </ThemeProvider>)
  }
}
