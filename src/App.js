import React from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import QRCode from 'qrcode.react'
import qrcodeParser from 'qrcode-parser'
import CropIcon from '@mui/icons-material/Crop'

const themeDic = {
  light: createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#3f51b5'
      },
      secondary: {
        main: '#f50057'
      }
    }
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9'
      },
      secondary: {
        main: '#f48fb1'
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

  scanImage = (imageBase64) => {
    this.setState({ value: '' })
    qrcodeParser(imageBase64)
      .then(result => {
        this.setState({ value: result, openMessage: true, message: { key: Date.now(), type: 'success', body: '已成功识别图片中二维码' } })
        setTimeout(() => { document.getElementById('text-input').select() })
      })
      .catch(() => {
        this.setState({ openMessage: true, message: { key: Date.now(), type: 'error', body: '无法识别图片中二维码' } })
      })
  }

  componentDidMount () {
    window.utools.onPluginEnter(({ code, type, payload }) => {
      document.getElementById('text-input').focus()
      if (type === 'regex') {
        this.setState({ value: payload })
        return
      }
      if (type === 'window') {
        if (window.utools.readCurrentBrowserUrl) {
          this.setState({ value: '' })
          window.utools.readCurrentBrowserUrl().then((url) => {
            this.setState({ value: url })
          })
        } else {
          // 适配旧版
          setTimeout(() => {
            this.setState({ value: window.utools.getCurrentBrowserUrl() || '' })
          })
        }
        return
      }
      if (type === 'img') {
        this.scanImage(payload)
        return
      }
      if (payload.includes('扫码') || payload.includes('截图')) {
        this.handleScreencapture()
      }
    })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.setState({ theme: e.matches ? 'dark' : 'light' })
    })
  }

  handleScreencapture = () => {
    window.utools.screenCapture(this.scanImage)
  }

  handleInputChange = (event) => {
    let value = event.target.value
    if (value.length > 1024) value = value.substr(0, 1024)
    this.setState({ value })
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
          <div className='app-input'>
            <TextField
              label=''
              id='text-input'
              placeholder='输入文字内容或粘贴截图'
              autoFocus
              multiline
              rows={10}
              variant='filled'
              fullWidth
              onChange={this.handleInputChange}
              value={value}
            />
            <Tooltip placement='left' title='截图识别二维码'>
              <IconButton onClick={this.handleScreencapture} className='app-btn-screencapture'>
                <CropIcon />
              </IconButton>
            </Tooltip>
          </div>
          <div className='app-output'>
            <Tooltip placement='top' title='点击复制二维码图片'>
              <Paper className='app-qrcode'>
                <QRCode id='qrcode' size={256} value={value} onClick={this.handleCopy} />
              </Paper>
            </Tooltip>
            <Snackbar
              key={message.key}
              open={openMessage}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
