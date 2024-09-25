// const request = require("supertest");
// const app = require("../../app");
// const RoomModel = require("../../../models/roomModel");


// const token = 

// describe("Room API Endpoints", () => {

//   describe("create Room", () => {
//     it("should return 201 and the Room created", async () => {
//       const response = await request(app)
//         .post("/api/v1/room")
//         .set('Authorization', `Bearer ${token}`)
//         .set("content-type", "application/json")
//         .send({
//           name: "Room testing",
//           completed: "true",
//         });

//       expect(response.status).toBe(201);
//       expect(response.body).toHaveProperty("room");
//     });
//   });


//   describe("get all room", () => {
//     it("should return 200 and all room", async () => {
//       const response = await request(app)
//         .get("/api/v1/room")
//         .set("content-type", "application/json");

//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty("room");
//     });
//   });

//   describe("get a Room", () => {
//     let Room;
//     beforeEach(async () => {
//       Room = await RoomModel.create({
//         name: "Room testid",
//       });
//     });

//     it("should return 200 and a single Room", async () => {
//       const response = await request(app)
//         .get(`/api/v1/room/${Room.id}`)
//         .set("content-type", "application/json");

//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty("Room");
//     });
//   });

//   describe("update a Room", () => {
//     let Room;
//     beforeEach(async () => {
//       Room = await RoomModel.create({
//         name: "Room2 testid",
//       });
//     });

//     it("should return 404 if the Room with the id doesnt exist", async () => {
//       const RoomId = "639c80ef98284bfdf111ad09";
//       const response = await request(app).patch(`/api/v1/room/${RoomId}`);

//       expect(response.status).toBe(404);
//       expect(response.body.msg).toEqual("this Room does not exist");
//     });


//     it("should return 200 and the updated Room", async () => {
//       const response = await request(app)
//         .patch(`/api/v1/room/${Room.id}`)
//         .send({ name: "newRoom" });

//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty("Room");
//     });
//   });

//   describe("delete a Room", () => {
//     let Room;
//     beforeEach(async () => {
//       Room = await RoomModel.create({
//         name: "Room2 testid",
//       });
//     });

//     it("should return 404 if the Room with the id doesnt exist", async () => {
//       const RoomId = "639c80ef98284bfdf111ad09";
//       const response = await request(app).delete(`/api/v1/room/${RoomId}`);

//       expect(response.status).toBe(404);

//       expect(response.body.msg).toEqual("this Room does not exist");
//     });

//     it("should return 200 and the deleted Room", async () => {
//       const response = await request(app).delete(`/api/v1/room/${Room.id}`);

//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty("Room");
//     });
//   });
// });