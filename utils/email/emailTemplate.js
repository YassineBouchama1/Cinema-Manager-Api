exports.confirmationEmail = async (name) => {
    return `<b>Hello world! ${name}</b>`;
};

exports.forgetPasswordEmail = async (url) => {
    return `<b>forget your passowrd link :  ${url}</b>`;
};
