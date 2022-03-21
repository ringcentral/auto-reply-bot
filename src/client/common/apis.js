import fetch from '../lib/fetch'

const {
  server
} = window.rc

export async function getUser () {
  const url = `${server}/api/user`
  return fetch.get(url, {
    handleErr: (err) => {
      console.log(err)
    }
  })
}

export async function listRecs () {
  const url = `${server}/api/list`
  return fetch.get(url)
}

export async function updateRec (id, update) {
  const url = `${server}/api/update`
  return fetch.post(url, {
    id,
    update
  })
}

export async function delRec (id) {
  const url = `${server}/api/del/${id}`
  return fetch.post(url, {})
}

export async function createRec (data) {
  const url = `${server}/api/create`
  return fetch.put(url, data)
}

export async function updateUser (update) {
  const url = `${server}/api/update-user`
  return fetch.post(url, update)
}
