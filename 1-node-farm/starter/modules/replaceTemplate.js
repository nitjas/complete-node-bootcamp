// assigning anonymous function to exports property on module
module.exports = (temp, product) => {

    // not a good practice to directly manipulate the arguments we pass in to a function
    // so the new variable output
    // not a const, but a let
    // let we can mutate after it's been created
    let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName); // use regex to replace all, not just the first one
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%ID%}/g, product.id);
    output = output.replace(/{%SLUG%}/g, product.slug);

    // organic is special
    if (product.organic)
        output = output.replace(/{%NOT_ORGANIC%}/g, ''); // remove ugly {%NOT_ORGANIC%}
    else (!product.organic)
        output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic'); // class name for display: none;

    return output;
}