import { Result } from "./build/Result.js"


interface AppError extends Error { }

// 成功
function fetchUserProfile() { return Result.Success({ name: 'Admin' }) }
// 失敗
function fetchUserFavorateAlbumIds() { return Result.Success(['1', '2', '3']) }
// 成功
function fetchAlbumById(id: string) { return Result.Failure<{ id: string, }, AppError>({ name: 'FetchError', message: 'Could not fetch the album.'}) }
// 成功
function fetchAlbumCoverById(id: string) { return Result.Success({ cover: '' }) }

const result = fetchUserProfile()
    .tap(_ => console.log('fetchUserProfile: success!'))
    .tapErr(_ => console.log('fetchUserProfile: failure'))
    .andThen(fetchUserFavorateAlbumIds)
    .tap(_ => console.log('fetchUserFavorateAlbumIds: success!'))
    .tapErr(_ => console.log('fetchUserFavorateAlbumIds: failure!'))
    .andThen(ids => Result.combine(ids.map(fetchAlbumById)))
    .tap(_ => console.log('fetchAlbumById: success!'))
    .tapErr(_ => console.log('fetchAlbumById: failure!'))
    .andThen(albums => Result.combine(albums.map(album => fetchAlbumCoverById(album.id))))
    .tap(_ => console.log('fetchAlbumCoverById: success!'))
    .tapErr(_ => console.log('fetchAlbumCoverById: failure!'))

if(result.isSuccess) {
    console.log(`${result.value}`)
} else {
    console.log(`${result.error.name}: ${result.error.message}`)
}
