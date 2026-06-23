import prisma from "../prismaClient.js";


const serializeProduct = (product) => ({
    ...product,
    date: Number(product.date),
});



const addProduct = async (req, res) => {
    try {

        const {
            name,
            description,
            price,
            category,
            subCategory,
            sizes,
            bestseller,
            stock
        } = req.body;


        const image1 = req.files?.image1?.[0];
        const image2 = req.files?.image2?.[0];
        const image3 = req.files?.image3?.[0];
        const image4 = req.files?.image4?.[0];


        const images = [
            image1,
            image2,
            image3,
            image4
        ].filter(Boolean);


        // Cloudinary URL
        const imagesUrl = images.map(
            (item) => item.path
        );


        const product = await prisma.product.create({

            data: {

                name,
                description,
                category,
                price: Number(price),

                subCategory,

                bestseller:
                    bestseller === "true" ||
                    bestseller === true,

                sizes: JSON.parse(sizes),

                image: imagesUrl,

                stock:
                    stock !== undefined
                        ? Number(stock)
                        : 99,

                date: BigInt(Date.now()),
            },
        });


        res.json({
            success: true,
            message: "Product Added",
            product: serializeProduct(product)
        });


    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });

    }
};





const updateProduct = async (req, res) => {

    try {

        const {
            id,
            name,
            description,
            price,
            category,
            subCategory,
            sizes,
            bestseller,
            stock
        } = req.body;



        const data = {};


        if (name !== undefined)
            data.name = name;


        if (description !== undefined)
            data.description = description;


        if (price !== undefined)
            data.price = Number(price);


        if (category !== undefined)
            data.category = category;


        if (subCategory !== undefined)
            data.subCategory = subCategory;


        if (sizes !== undefined)
            data.sizes = JSON.parse(sizes);


        if (bestseller !== undefined)
            data.bestseller =
                bestseller === "true" ||
                bestseller === true;


        if (stock !== undefined)
            data.stock = Number(stock);



        if (
            req.files &&
            Object.keys(req.files).length > 0
        ) {


            const newImages = [

                "image1",
                "image2",
                "image3",
                "image4"

            ]

            .map(
                (key) =>
                    req.files[key]?.[0]
            )

            .filter(Boolean)

            // Cloudinary URL
            .map(
                (file) => file.path
            );



            if (newImages.length > 0) {

                data.image = newImages;

            }

        }




        const product =
            await prisma.product.update({

                where: {
                    id
                },

                data

            });



        res.json({

            success: true,

            message: "Product Updated",

            product:
                serializeProduct(product)

        });



    } catch (error) {


        console.log(error);


        res.json({

            success: false,

            message: error.message

        });


    }

};






const listProducts = async (req, res) => {

    try {

        const products =
            await prisma.product.findMany({

                orderBy: {
                    date: "desc"
                }

            });



        res.json({

            success: true,

            products:
                products.map(
                    serializeProduct
                )

        });


    } catch (error) {

        console.log(error);


        res.json({

            success: false,

            message: error.message

        });

    }

};






const removeProduct = async (req, res) => {

    try {


        const {
            id
        } = req.body;



        await prisma.product.delete({

            where: {
                id
            }

        });



        res.json({

            success: true,

            message:
                "Product Removed"

        });



    } catch (error) {


        console.log(error);



        res.json({

            success: false,

            message:
                error.message

        });


    }

};






const singleProduct = async (req, res) => {

    try {


        const {
            productId
        } = req.body;



        const product =
            await prisma.product.findUnique({

                where: {
                    id: productId
                }

            });



        res.json({

            success: true,

            product:
                product
                    ? serializeProduct(product)
                    : null

        });



    } catch (error) {


        console.log(error);



        res.json({

            success: false,

            message:
                error.message

        });


    }

};






const decrementStock = async (items) => {


    if (
        !Array.isArray(items) ||
        items.length === 0
    )
        return;



    for (const item of items) {


        const productId =
            item.productId ||
            item.id;



        const quantity =
            item.quantity ||
            item.qty ||
            1;



        if (!productId)
            continue;



        const product =
            await prisma.product.findUnique({

                where: {
                    id: productId
                }

            });



        if (!product) {

            throw new Error(
                `Product not found: ${productId}`
            );

        }



        if (product.stock < quantity) {


            throw new Error(

                `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${quantity}`

            );

        }



        await prisma.product.update({

            where: {
                id: productId
            },


            data: {

                stock:
                    product.stock - quantity

            }

        });

    }

};





export {
    listProducts,
    addProduct,
    updateProduct,
    removeProduct,
    singleProduct,
    decrementStock,
};