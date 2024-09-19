const expressAsyncHandler = require("express-async-handler")

const ApiError = require('../utils/ApiError')



// useing model that passed to handle 
exports.createOne = (Model) => {

    expressAsyncHandler(async (req, res) => {

        const document = await Model.create(req.body);
        res.status(200).json({ data: document })
    })
}

exports.createOne = (Model) => expressAsyncHandler(async (req, res) => {



    const document = await Model.create(req.body)

    res.status(200).json({ data: document })

})

exports.getOne = (Model) => expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id)

    if (!document) {
        return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ data: document })
})



exports.getAll = (Model) =>
    expressAsyncHandler(async (req, res) => {

        const documents = await Model.find()

        if (!documents) {
            return next(
                new ApiError(`There is no documents for this user id : ${req.user._id}`, 404)
            );
        }
        res.status(200)
            .json({ results: documents.length, data: documents });
    });




exports.deleteOne = (Model) => expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id)

    if (!document) {

        return next(new ApiError(`the is no document belong this id ${id}`, 400))
    }


    res.status(202).json({ data: document })
})


exports.updateOne = (Model) => expressAsyncHandler(async (req, res, next) => {


    const document = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true })

    if (!document) {

        return next(new ApiError(`the is no document belong this id ${req.params.id}`, 404))
    }
    // //trigger "save" event when update doc
    document.save()

    res.status(201).json({ status: true })
})