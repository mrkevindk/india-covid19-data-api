const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'covid19India.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}
initializeDBAndServer()

//GET State's List API

app.get('/states/', async (request, response) => {
  const stateDetailsQuery = `
    SELECT 
        state_id as stateId,
        state_name as stateName,
        population
    FROM 
        state
    ORDER BY 
        state_id;`
  const dbResponse = await db.all(stateDetailsQuery)
  response.send(dbResponse)
})

//GET State with Id API

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const stateIdQuery = `
  SELECT 
    state_id as stateId,
    state_name as stateName,
    population
  FROM 
    state
  WHERE
    state_id = ${stateId};`
  const dbResponse = await db.get(stateIdQuery)
  response.send(dbResponse)
})

//CREATE District API

app.post('/districts/', async (request, response) => {
  const districtDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails
  const districtQuery = `
  INSERT INTO 
    district (district_name, state_id, cases, cured, active, deaths)
  VALUES 
    ('${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths});`
  await db.run(districtQuery)
  response.send('District Successfully Added')
})

//GET DistrictID API

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtIDQuery = `
  SELECT 
    district_id as districtId,
    district_name as districtName,
    state_id as stateId,
    cases,
    cured,
    active,
    deaths
  FROM 
    district
  WHERE 
    district_id = ${districtId};`
  const dbResponse = await db.get(districtIDQuery)
  response.send(dbResponse)
})

//Delete DistrictID API

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteQuery = `
  DELETE
  FROM
    district
  WHERE 
    district_id = ${districtId};`
  await db.run(deleteQuery)
  response.send('District Removed')
})

//UPDATE District API
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails
  const updateDistrictQuery = `
  UPDATE
    district
  SET 
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
  WHERE 
    district_id = ${districtId};`
  const dbResponse = await db.run(updateDistrictQuery)
  response.send('District Details Updated')
})

//GET StateID API

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const stateIdStaticsQuery = `
  SELECT 
    SUM(cases) as totalCases,
    SUM(cured) as totalCured,
    SUM(active) as totalActive,
    SUM(deaths) as totalDeaths
  FROM
    district
  WHERE 
    state_id = ${stateId};`
  const dbResponse = await db.get(stateIdStaticsQuery)
  response.send(dbResponse)
})

//GET DistrictID Details API

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const districtIDQuery = `
  SELECT 
    state_id
  FROM
    district
  WHERE
    district_id = ${districtId};`
  const districtDBResponse = await db.get(districtIDQuery)
  const stateNameQuery = `
  SELECT
    state_name as stateName
  FROM
    state
  WHERE
    state_id = ${districtDBResponse.state_id};`
  const dbResponse = await db.get(stateNameQuery)
  response.send(dbResponse)
})

module.exports = app
