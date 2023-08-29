import { checkTokenExpire, postRefereshToken } from '@src/api/authApi'
import { getCookieToken, removeCookieToken, setRefreshToken } from '@src/storage/Cookie'
import store from '@src/store/config'
import { DELETE_TOKEN, SET_TOKEN } from '@src/store/slices/authSlice'
import { InternalAxiosRequestConfig } from 'axios'

const { dispatch } = store

const CheckAuthorization = async (config: InternalAxiosRequestConfig) => {
  const refresh_token = getCookieToken()
  const access_token = localStorage.getItem('accessToken')

  if (!access_token || !refresh_token) {
    removeCookieToken()
    dispatch(DELETE_TOKEN())
    return 'Failed'
  }
  const status = await checkTokenExpire()

  if (status === 200) {
    config.headers['Authorization'] = `Bearer ${access_token}`
    return config
  } else {
    if (refresh_token) {
      const { status, tokens } = (await postRefereshToken()) as IResponseType
      if (status === 200) {
        removeCookieToken()
        dispatch(SET_TOKEN(tokens.accessToken))
        setRefreshToken(tokens.refreshToken)
        config.headers['Authorization'] = `Bearer ${access_token}`
        return config
      } else {
        removeCookieToken()
        dispatch(DELETE_TOKEN())
        alert('토큰이 만료되어 자동으로 로그아웃 되었습니다. 다시 로그인 해주세요.')
        return 'Failed'
      }
    } else {
      removeCookieToken()
      dispatch(DELETE_TOKEN())
      return 'Failed'
    }
  }
}

export default CheckAuthorization
