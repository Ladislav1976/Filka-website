import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import StepsInput from "./StepsInput";
import SaveLoading from "../reports/SaveLoading";
import SaveSaved from "../reports/SaveSaved";
import DeleteConfirm from "../reports/DeleteConfirm";
import ImageDeleteError from "../reports/ImageDeleteError";
import SaveError from "../reports/SaveError";
import SaveErrorMissing from "../reports/SaveErrorMissing";
import Lightbox from "./Lightbox";
import style from "./NewFood.module.css";
import IngredientInput from "./IngredientInput";
import LeftPanelFilter from "./LeftPanelFilter";
import React, { Component } from "react";
import Image from "./Image";
import UrlInput from "./Url";
import Modal from "../reports/Modal";
import ModalPreview from "../reports/ModalPreview";
import { useGet, useMutate } from "restful-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowUp, faSpinner, faPenToSquare, faFloppyDisk, faTrash, faBackward, faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { useQueries, useQuery, useQueryClient, useMutation, } from "@tanstack/react-query"
import { createPostStep, createPutStep, createDeleteStep, createPostUrl, createDeleteUrl, createPutUrl, createPostUnit, createPostIngredient, createPostIngredients, createPostFoodTag, createDeleteFood, createPutFood, createPostImagefood, createDeleteImagefood2, createPutImagefood, createDeleteIngredients, createPutIngredients, createPostFunction, createDeleteImagefood } from "../hooks/use-post";
// import { postStepMutation } from "../hooks/use-mutate";
import PostStepMutation from "../hooks/use-mutate";
import { imageExists, getFood, getIngredients, getIngredientsID, getIngredient, getIngredientID, getUnit, getUnitID, getImageFood, getImage, getSteps, getStep, getFoodTags, getUrl, queryFnFoodTagName, queryFnFoodTagId, queryFnFoodTagToId, queryFnFoodStep } from "../hooks/use-get";





function EditFood(props) {
  const queryClient = useQueryClient();
  const component = "editcomponent"
  const navigate = useNavigate()
  const [foodID, setFoodID] = useState()
  const [name, setName] = useState("")
  // const [nameTagSet, setNameTagSet] = useState()
  const [ingredientsList, setIngredientsList] = useState([]);
  const [urlList, setUrlList] = useState([
    // {id:1,url:"https://www.w3schools.com/tags/att_a_href.asp"},
    // {id:2,url:
    // "https://developer.mozilla.org/en-US/docs/Web/CSS/Subsequent-sibling_combinator"}
  ])
  const [stepsList, setStepsList] = useState([]);
  const [foodTagSet, setFoodTagSet] = useState(new Set());
  const [date, setDate] = useState("")
  const newdate = new Date(date).toLocaleDateString('sk-SK')






  const [images, setImages] = useState("");
  const [imageURLsList, setImageURLsList] = useState([])
  const [imageFlag, setImageFlag] = useState(true);
  const [modalLoadingFlag, setModalLoadingFlag] = useState(false);
  const [modalSavedFlag, setModalSavedFlag] = useState(false);
  const [modalDeleteFlag, setModalDeleteFlag] = useState(false);
  const [modalErrorFlag, setModalErrorFlag] = useState(false);
  const [modalSaveErrorMissingFlag, setModalSaveErrorMissingFlag] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalImageDeleteErrorFlag, setModalImageDeleteErrorFlag] = useState(false);
  const [modalLightboxFlag, setModalLightboxFlag] = useState(false);
  const [isVisibleEdit, setIsVisibleEdit] = useState(false)




  const id = useParams()
  let ID = parseInt(id.id)


  const dataFoods = useQuery({
    queryKey: ["foods", ID],
    enabled: !!id,
    queryFn: () => getFood(ID),
  })



  const putFood = useMutation({
    mutationFn: createPutFood,
    onError: error => {
      console.log("Error Put Food :", error);
      setModalLoadingFlag(false);
      handlerSetModalError()
    },
    onSuccess: (foodUpdated) => {
      console.log("Food :", foodUpdated, "sucsesfully updated!");
      queryClient.setQueryData(["foods", foodUpdated.data.id], foodUpdated.data)
      queryClient.invalidateQueries(["foods"],)
      setModalLoadingFlag(false)
      handlerSetModalSave()
    }
  })

  const deleteFood = useMutation({
    mutationFn: createDeleteFood,
    onError: error => {
      console.log("Error Delete Food :", error);
      setModalLoadingFlag(false);
      handlerSetModalError()
    },
    onSuccess: (foodUpdated) => {
      console.log("Food :", foodUpdated, "sucsesfully updated!");
      queryClient.invalidateQueries(["foods"],)
      setModalLoadingFlag(false);
      handlerFoodDeleteConfirmed()
    }
  })




  const dataFoodsImage = useQueries({
    queries: dataFoods.isLoading == false
      ? dataFoods?.data?.images?.map((id) => ({
        queryKey: ["imagefood", id],
        queryFn: () => getImage(id),
        staleTime: Infinity,
      })
      ) : [],

    combine: (results) => {
      if (!results) return
      return {
        data: results.map((result) => result.data),
        isPending: results.some((result) => result.isPending),
        isLoading: results.some((result) => result.isLoading),
        isSuccess: results.some((result) => result.isSuccess),
        status: results.some((result) => result.status),
        isFetched: results.some((result) => result.isFetched),
        fetchStatus: results.some((result) => result.fetchStatus),
      }
    },
  })
  const postImagefood = useMutation({
    mutationFn: createPostImagefood,
    onError: error => { console.log("Error Post Imagefood :", error); },
    onSuccess: (ImagefoodCreated) => {
      console.log("Imagefood :", ImagefoodCreated, "sucsesfully created!")
      queryClient.setQueryData(["imagefood", ImagefoodCreated.data.id], ImagefoodCreated.data)
      queryClient.invalidateQueries(["imagefood"])
    }
  })

  const putImagefood = useMutation({
    mutationFn: createPutImagefood,
    retry: 3,
    onError: error => { console.log("Error Put Imagefood :", error) },
    onSuccess: (ImagefoodUpdated) => {
      console.log("Imagefood :", ImagefoodUpdated.data, "sucsesfully updated!")
      queryClient.setQueryData(["imagefood", ImagefoodUpdated.data.id], ImagefoodUpdated.data)
      queryClient.invalidateQueries(["imagefood"])
    }
  })

  const deleteImagefood = useMutation({
    mutationFn: createDeleteImagefood,
    onError: error => { console.log("Error Delete Imagefood :", error) },
    onSuccess: (response, imageDeleted) => {
      console.log("Imagefood :", imageDeleted, "sucsesfully deleted!")
      queryClient.invalidateQueries(["imagefood"])
    }
  })

  const dataFoodTags = useQuery({
    queryKey: ["foodTags"],
    queryFn: getFoodTags,
  })
  const postFoodTag = useMutation({
    mutationFn: createPostFoodTag,
    onError: error => { console.log("Error Post FoodTag :", error);handlerSetModalError() },
    onSuccess: (foodTagCreated) => {
      console.log("FoodTag :", foodTagCreated, "sucsesfully created!")
      queryClient.setQueryData(["foodTags"], (prev) => {
        if (!prev) return undefined;
        return [...prev,
          foodTagCreated]
      })
      queryClient.invalidateQueries(["foodTags"])
      addTagTofoodTagSet(foodTagCreated)

    }
  })


  const dataFoodsSteps = useQueries({

    queries: dataFoods.isLoading == false

      ? dataFoods?.data?.steps?.map((id) => ({
        queryKey: ["steps", id],
        queryFn: () => getStep(id),
        staleTime: Infinity,

      })) : [],
    combine: (results) => {
      if (!results) return
      return {
        data: results?.map((result) => result.data)
          .sort(function (a, b) {
            return a.position - b.position;
          })
        ,

        isPending: results.some((result) => result.isPending),
        isLoading: results.some((result) => result.isLoading),
        isSuccess: results.some((result) => result.isSuccess),
        status: results.some((result) => result.status),
        isFetched: results.some((result) => result.isFetched),
        //       // statusError: results.some((result) => result.status ==="error"),
        //       // errorMessage: results.some((result) => result.status ==="error"),
      }
    },
  })

  const postStep = useMutation({
    mutationFn: createPostStep,
    onError: error => { console.log("Error Post Step :", error) },
    onSuccess: (stepCreated, old) => {
      console.log("Step :", stepCreated, "sucsesfully created!", old)
      queryClient.setQueryData(["steps", stepCreated.data.id], stepCreated.data
      )
      queryClient.invalidateQueries(["steps"])
    }
  })


  const putStep = useMutation({
    // queryKey: (id) => [`/steps/${id}/`],
    mutationFn: createPutStep,
    onError: error => { console.log("Error Put Step :", error) },
    onSuccess: (stepUpdated) => {
      console.log("Step :", stepUpdated, "sucsesfully updated!",)
      queryClient.setQueryData(["steps", stepUpdated.data.id], stepUpdated.data)
      queryClient.invalidateQueries(["steps"])
    }
  })

  const deleteStep = useMutation({
    mutationFn: createDeleteStep,
    onError: error => { console.log("Error Delete Step :", error) },
    onSuccess: (response, deletedStep) => {
      console.log("Step :", deletedStep, "sucsesfully deleted!", response)
      queryClient.invalidateQueries(["steps"])
    }
  })



  const dataIngredients = useQuery({
    queryKey: ["ingredients"],
    queryFn: getIngredients,
  })



  const postIngredients = useMutation({
    mutationFn: createPostIngredients,
    onError: error => { console.log("Error Post Ingredients :", error) },
    onSuccess: (ingredientsCreated) => {
      console.log("Ingredients :", ingredientsCreated, "sucsesfully created!")
      queryClient.setQueryData(["ingredients"], (prev) => {
        if (!prev) return undefined;
        return [...prev.filter(p => p.id != ingredientsCreated.data.id),
        ingredientsCreated.data]
      })
      // queryClient.setQueryData(["ingredients", ingredientsCreated.data.id], ingredientsCreated.data)
      queryClient.invalidateQueries(["ingredients"])
      // return ingredientsCreated
    }
  })

  const deleteIngredients = useMutation({
    // queryKey: (ingredients) => ["/ingredients/", ingredients.id],
    mutationFn: createDeleteIngredients,
    // onError: error => { console.log("Error Delete ingredients :", error); handlerSetModalError() },
    onSuccess: (ingredients, variable) => {
      console.log("Ingredients :", ingredients, "sucsesfully deleted!")

      queryClient.setQueryData(["ingredients"], (prev) => {
        console.log("pred :", prev, "variable DELETE:", variable)
        if (prev === undefined) return [];
        return [...prev.map((pre) => {
          if (pre.id !== variable.id) { return pre }

        }
        )]
      });
      queryClient.invalidateQueries(["ingredients"]);

    }
  })

  const putIngredients = useMutation({
    // queryKey: (id) => [`/steps/${id}/`],
    mutationFn: createPutIngredients,
    onError: error => { console.log("Error Put Ingredients :", error) },
    onSuccess: (ingredientsUpdated, variable) => {
      console.log("Ingredients :", ingredientsUpdated, "sucsesfully updated!");

      queryClient.setQueryData(["ingredients"], (prev) => {

        if (prev === undefined) { return [ingredientsUpdated.data] } else {
          ;
          return [...prev.map((pre) => {
            if (pre.id === variable.id) { return ingredientsUpdated.data }
            else { return pre }
          }
          )]
        }
      });
      queryClient.invalidateQueries(["ingredients"]);
      // return ingredientsUpdated



    }
  })



  const dataIngredient = useQuery({
    queryKey: ["ingredient"],
    // enabled: !!dataIngredients,
    queryFn: getIngredient,
  })

  const postIngredient = useMutation({
    mutationFn: createPostIngredient,
    onError: error => { console.log("Error Post Ingredient :", error) },
    onSuccess: (ingredientCreated, ingredient) => {
      console.log("Ingredient :", ingredientCreated, "sucsesfully created!")
      queryClient.setQueryData(["ingredient"], (prev) => {
        if (!prev) return undefined;
        return [...prev.filter(p => p.id != ingredientCreated.data.id),
        ingredientCreated.data]
      })
      queryClient.invalidateQueries(["ingredient"])

    }
  })

  const dataUnit = useQuery({
    queryKey: ["unit"],
    queryFn: getUnit,
  })

  const postUnit = useMutation({
    mutationFn: createPostUnit,
    onError: error => { console.log("Error Post Unit :", error) },
    onSuccess: (unitCreated, unit) => {
      console.log("Unit :", unitCreated, "sucsesfully created!")
      queryClient.setQueryData(["unit"], (prev) => {
        if (!prev) return undefined;
        return [...prev.filter(p => p.id != unitCreated.data.id),
        unitCreated.data]
      })
      queryClient.invalidateQueries(["unit"])
    }
  })


  const dataUrl = useQueries({

    queries: dataFoods.isLoading == false

      ? dataFoods?.data?.urls?.map((id) => ({
        queryKey: ["url", id],
        queryFn: () => getUrl(id),
        staleTime: Infinity,

      })) : [],
    combine: (results) => {
      if (!results) return
      return {
        data: results?.map((result) => result.data),
        isPending: results.some((result) => result.isPending),
        isLoading: results.some((result) => result.isLoading),
        isSuccess: results.some((result) => result.isSuccess),
        status: results.some((result) => result.status),
        isFetched: results.some((result) => result.isFetched),
      }
    },
  })

  const postUrl = useMutation({
    mutationFn: createPostUrl,
    onError: error => { console.log("Error Post URL :", error) },
    onSuccess: (urlCreated, old) => {
      console.log("URL :", urlCreated, "sucsesfully created!", old)
      queryClient.setQueryData(["url", urlCreated.data.id], urlCreated.data
      )
      queryClient.invalidateQueries(["url"])
    }
  })

  const deleteUrl = useMutation({
    mutationFn: createDeleteUrl,
    onError: error => { console.log("Error Delete URL :", error) },
    onSuccess: (response, deletedURL) => {
      console.log("Step :", deletedURL, "sucsesfully deleted!", response)
      queryClient.invalidateQueries(["url"])
    }
  })

  const putUrl = useMutation({

    mutationFn: createPutUrl,
    onError: error => { console.log("Error Put URL :", error) },
    onSuccess: (UrlUpdated) => {
      console.log("Step :", UrlUpdated, "sucsesfully updated!",)
      queryClient.setQueryData(["url", UrlUpdated.data.id], UrlUpdated.data)
      queryClient.invalidateQueries(["url"])
    }
  })

  useEffect(() => {
    let food = ""
    // console.log("dataFoods.isSuccess :", dataFoods.isLoading == false)
    // console.log("dataFoodsImage.isSuccess :", dataFoodsImage.isLoading == false)
    // console.log("dataFoodTags.isSuccess :", dataFoodTags.isLoading == false)
    // console.log("dataFoodsSteps.isSuccess :", dataFoodsSteps.isLoading == false)
    // console.log("dataFoodsIngre.isSuccess :", dataFoodsIngre.isLoading == false)
    // console.log("dataFoodsUnit.isSuccess :", dataFoodsUnit.isLoading == false)
    if (dataFoods.isLoading == false) {
      if (dataFoodsImage.isLoading == false) {
        if (dataFoodTags.isLoading == false) {
          if (dataFoodsSteps.isLoading == false) {
            if (dataIngredients.isLoading == false) {
              if (dataIngredient.isLoading == false) {
                if (dataUnit.isLoading == false) {
                  if (dataUrl.isLoading == false) {
                    food = handleFood()
                    setFoodID(food.id);
                    setName(food.name);
                    // setNameTagSet(food.nameTags);
                    setUrlList(food.urls)
                    setFoodTagSet(food.foodTags);
                    setStepsList(food.steps);
                    setIngredientsList(food.ingredients);
                    setDate(food.date);
                    setImageURLsList(food.images);

                  } else {
                  }
                } else {
                }
              } else {
              }
            } else {
            }
          } else {
          }
        } else {
        }

      } else {
      }
    } else {
    }

  }, [dataFoods.isLoading, dataFoodsImage.isLoading, dataFoodTags.isLoading, dataFoodsSteps.isLoading, dataIngredients.isLoading, dataIngredient.isLoading, dataUnit.isLoading, dataUrl.isLoading
  ])


  const backEndFood = dataFoods.data ?? [];
  const backEndFoodTags = dataFoodTags.data ?? [];
  const backEndSteps = dataFoodsSteps.data ?? [];
  const backEndUrls = dataUrl.data ?? [];
  const backEndImagefood = dataFoodsImage.data ?? [];
  const backEndIngredients = dataIngredients.data ?? [];
  const backEndIngredient = dataIngredient.data ?? [];
  const backEndUnit = dataUnit.data ?? [];

  function handleFood() {





    // imageFood
    // function imageFoodListDownl() {
    //   let newBackEndImagefood = dataImagefood?.filter((e) =>
    //     e.food === backEndFood.id);
    //   //sorting of imageFoodList from 1 to 999
    //   newBackEndImagefood.sort(function (a, b) {
    //     return a.imgposition - b.imgposition;
    //   });
    //   return newBackEndImagefood
    // }

    function ingredientsListDownl() {
      let ingredients = []
      backEndFood.ingredients.map((datatags) => {
        backEndIngredients.map((e) => {
          if (e.id == datatags) {
            backEndUnit.map((u) => {
              if (u.id == e.units) {
                backEndIngredient?.map((i) => {
                  if (i.id == e.ingredientName) {
                    ingredients.push({
                      id: e.id,
                      quantity: e.quantity,
                      unit: [u],
                      ingredient: [i],
                      position: e.position,
                      statusDelete: false
                    })
                  }
                })
              }
            })
          }
        }
        )
      })
      ingredients.sort(function (a, b) {
        return a.position - b.position;
      })

      return ingredients
    }

    function itemListDownl(backEndFood, backEndItems, sorting, del) {
      let returnList = []

      backEndFood?.forEach((f) => {
        backEndItems?.map((e) => {
          if (e.id === f) {
            if (del) {
              returnList.push({
                ...e,
                statusDelete: false
              })
            } else {
              {
                returnList.push({
                  ...e,
                })
              }
            }
          }
        });
      });
      //sorting of items from 1 to 999
      if (sorting) {
        returnList.sort(function (a, b) {
          return a.position - b.position;
        })
      };
      return returnList

    }

    return ({
      id: backEndFood.id,
      name: backEndFood.name,
      images: itemListDownl(backEndFood.images, backEndImagefood, true, true),
      ingredients: ingredientsListDownl(),
      steps: itemListDownl(backEndFood.steps, backEndSteps, true, true),
      urls: itemListDownl(backEndFood.urls, backEndUrls, false, true),
      foodTags: itemListDownl(backEndFood.foodTags, backEndFoodTags, false, false),
      date: backEndFood.date,
    })
  }

  // setFoodID(food.id);
  // setName(food.name);
  // setNameTagSet(food.nameTags);
  // setFoodTagSet(food.foodTags);
  // setStepsSet(food.steps);
  // setIngredientsList(food.ingredients);
  // setDate(food.date);
  // setImageURLs(food.images);
  // setImageURLsList(food.images);
  // setImageURLsPost(food.images);
  function handleFoodDelete() {
    setModalDeleteFlag(true)
  }


  function handleFoodSave() {


    const filterIngredients = ingredientsList.filter((ingre) => ingre.position !== "delete")

    if (
      !name &&
      filterIngredients.length === 0 &&
      foodTagSet.size === 0 &&
      stepsList === ""
    ) {
      alert("Nazov , Suroviny, Druj jedla, Postup nie se uvedene");
    } else if (
      filterIngredients.length === 0 &&
      foodTagSet.size === 0 &&
      stepsList === ""
    ) {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: , Suroviny, Druj jedla, Postup");
    } else if (!name  && foodTagSet.size === 0 && stepsList === "") {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: Nazov , Druj jedla, Postup");
    } else if (!name && filterIngredients.length === 0 && stepsList === "") {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: Nazov, Suroviny, Postup");
    } else if (!name && filterIngredients.length === 0 && foodTagSet.size === 0) {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: Nazov, Suroviny, Druj jedla");
    } else if (!name && filterIngredients.length === 0) {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: Nazov,Suroviny");
    } else if (!name && foodTagSet.size === 0) {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: ,Nazov, Druj jedla");
    } else if (!name && stepsList === "") {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: Nazov, Postup");
    } else if (filterIngredients.length === 0 && foodTagSet.size === 0) {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: Suroviny,Druj jedla");
    } else if (filterIngredients.length === 0 && stepsList === "") {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: Suroviny,Postup");
    } else if (!name) {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: Nazov");
    } else if (filterIngredients.length === 0) {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: Suroviny");
    } else if (foodTagSet.size === 0) {
      handlerSetModalErrorMissing("Doplň chýbajúce informácie: Druj jedla");
    } else if (stepsList === "") {
      handlerSetModalErrorMissing("Druj jedla nie je uvedeny");
    } else {
      makeFoodRecord({
        id: foodID,
        name: name,
        date: date,
        foodTags: ([...foodTagSet]).map((tag) => tag.id)
      })
    }
    ;
  }

  // function handleAddToNameTagList() {
  //   let nameSplit = name?.split(" ");
  //   addToNameTagList(nameSplit);
  // }

  function handleNameChange(event) {
    setName(event.target.value);
  }


  function foodTagSetCheck(tag) {
    let filter = Array.from(foodTagSet).filter((f) => f.foodTag === tag)
    if (filter != "") {
      removeFromFoodTagSet(filter[0]);
    } else {
      handleAddTagToFoodTagSet(tag);
    }
  }

  // function foodTagListCheck2(tag) {
  //   console.log("foodTagListCheck2 :", tag)
  //   tag.map(ta => { foodTagListCheck(ta.tagName) })
  // }


  function ingredientsCheckPost(ing) {
    // console.log("unitFilter", "Unit", ing.units[0].unit, "Ingredient :", ing.ingredientName[0])


    let unitFilter = backEndUnit.find((element) => (element.unit == ing.units[0].unit))
    // console.log("unitFilter", unitFilter)

    if (unitFilter == null) {
      return postUnit.mutateAsync({ unit: ing.units[0].unit })
        .then((unit) => {
          let ingredientFilter = backEndIngredient.find((element) => element.ingredient == ing.ingredientName[0].ingredient)
          if (ingredientFilter == null) {
            return postIngredient.mutateAsync({ ingredient: ing.ingredientName[0].ingredient })
              .then((ingre) => {
                console.log("POST unit and ingredient do not exist", { unit: [unit.data.id], quantity: ing.quantity, ingredientName: [ingre.data.id], position: ing.position })
                return postIngredients.mutateAsync({
                  units: [unit.data.id],
                  quantity: ing.quantity,
                  ingredientName: [ingre.data.id],
                  position: ing.position
                })
              })
              .catch((err) => {
                handlerSetModalErrorMissing(err.message)
              })
          }
          else {
            console.log("POST unit not exist but ingredient exist")
            return (postIngredients.mutateAsync({
              units: [unit.data.id],
              quantity: ing.quantity,
              ingredientName: [ingredientFilter.id],
              position: ing.position
            }))
          }
        })
        .catch((err) => {
          handlerSetModalErrorMissing(err)

        })
    }
    else {
      let ingredientFilter = backEndIngredient.find((element) => element.ingredient == ing.ingredientName[0].ingredient)
      if (ingredientFilter == null) {
        return postIngredient.mutateAsync({ ingredient: ing.ingredientName[0].ingredient })
          .then((ingre) => {
            if (ingre.status == 201) {
              return (postIngredients.mutateAsync({
                units: [unitFilter.id],
                quantity: ing.quantity,
                ingredientName: [ingre.data.id],
                position: ing.position
              }))
            }
          })
          .catch((err) => {
            handlerSetModalErrorMissing(err.message)
          })
      }
      else {
        return (postIngredients.mutateAsync({
          quantity: ing.quantity,
          units: [unitFilter.id],
          ingredientName: [ingredientFilter.id],
          position: ing.position
        }
        ))
      }
    }
  }

  function addTagTofoodTagSet(foodTag) {
    let newFoodTagSet = new Set(foodTagSet);
    newFoodTagSet.add(foodTag);
    setFoodTagSet(newFoodTagSet);
  }

  function addToIngredientList(id, quantity, unit, ing) {
    if (ing === "") {
      return;
    }
    let newIngredientsList = ingredientsList.slice()
    newIngredientsList.push({ id: id, quantity: quantity, unit: [{ id: id, unit: unit }], ingredient: [{ id: id, ingredient: ing }], statusDelete: false }
    );
    setIngredientsList(newIngredientsList);
  }

  function makeIngredientsDelete(ingre) {
    setIngredientsList(makeItemDelete(ingre, ingredientsList))
  }

  function makeSteptoDelete(step) {
    setStepsList(makeItemDelete(step, stepsList))
  }

  function makeUrlToDelete(url) {
    setUrlList(makeItemDelete(url, urlList))
  }

  function makeItemDelete(item, array) {
    let itemIDPosition = getPosition(item.id, array);
    let newArray = array.slice();
    newArray.splice(itemIDPosition, 1, { ...item, statusDelete: true })
    return newArray;
  }


  // function updateStepList(oldID, newID, step) {
  //   console.log("step :", step)
  //   setStepsList(updateItemList(oldID, newID, { id: oldID, step: step ,statusDelete: false}, { id: newID, step: step ,statusDelete: false}, stepsList))
  // }

  function updateStepList(step) {
    setStepsList(updateItemList(step, stepsList))
  }

  function updateUrlList(url) {
    setUrlList(updateItemList( url, urlList))
  }

  // function updateUrlList(oldID, url) {
  //   setUrlList(updateItemList(oldID, newID, { id: oldID, url: url,statusDelete: false }, { id: newID, url: url,statusDelete: false }, urlList))
  // }
  function updateItemList(itemObj, array) {
  // function updateItemList(oldID, newID, itemOldObj, itemNewObj, array) {
    let position = getPosition(itemObj.id, array);
    // console.log(itemOldObj, itemNewObj)
    let newArray = array.slice();
    newArray.splice(position, 1, itemObj)
    // if (Number.isInteger(oldID)) {
    //   newArray.splice(position, 1, itemOldObj)
    // }
    // if (!Number.isInteger(oldID)) {
    //   if (newID == "") {
    //     newArray.splice(position, 1, itemOldObj)
    //   } if (newID) {
    //     newArray.splice(position, 1, itemNewObj)
    //   }
    // }
    return (newArray);
  }

  function handleAddUrl(url, urlList) {
    if (url.url == "") return
    setUrlList(addItem(url, urlList))
  }


  function handleAddStep(step, stepsList) {
    if (step.step == "") return
    setStepsList(addItem(step, stepsList))
  }

  function addItem(itemObj, array) {
    let newArray = array.slice();
    newArray.push(itemObj)
    return newArray;
  }

  function handleAddTagToFoodTagSet(foodTag) {
    let filterFoodTag = dataFoodTags.data.filter((element) => element.foodTag == foodTag);
    if (filterFoodTag == "") {
      postFoodTag.mutate({ foodTag: foodTag })
    } else { addTagTofoodTagSet(filterFoodTag[0]) }
  }

  function removeFromFoodTagSet(tag) {
    let newFoodTagSet = new Set(foodTagSet);
    newFoodTagSet.delete(tag);
    setFoodTagSet(newFoodTagSet);
  }

  function handleDataID(res) {
    let array = []
    res.map(r => { if (r.status !== 204) { array.push(r.data.id) } })
    return array
  }
  async function urlForPostHandler() {
    return Promise.all(

      urlList?.map((res) => {
        const urlVar = {
          id: res.id,
          url: res.url,
        }
       
        if (res.statusDelete === true && Number.isInteger(res.id)) {
          return deleteUrl.mutateAsync(urlVar)
        }
        if (Number.isInteger(res.id)) {
          return putUrl.mutateAsync(urlVar)
        }
        if (!Number.isInteger(res.id) && res.statusDelete === true) { return { status: 204 } }
        else {
          return postUrl.mutateAsync(urlVar)
        }

      })
    ).then(res => {
      return {
        status: "fullfilled",
        value: handleDataID(res)
      }
    }).catch((err) => {
      console.log("Error URL", err); handlerSetModalErrorMissing("Error URL");
      setModalLoadingFlag(false);
      handlerSetModalError()
    })

  }

  async function stepsForPostHandler() {

    return Promise.all(
      stepsList?.map((res, index) => {
        const stepVar = {
          id: res.id,
          step: res.step,
          position: index + 1,
        }

        if (res.statusDelete === true && Number.isInteger(res.id)) {
          return deleteStep.mutateAsync(stepVar)
        }
        if (Number.isInteger(res.id)) {
          return putStep.mutateAsync(stepVar)
        }
        if (!Number.isInteger(res.id) && res.statusDelete === true) { return { status: 204 } }
        else {
          return postStep.mutateAsync(stepVar)
        }

      })
    ).then(res => {
      return {
        status: "fullfilled",
        value: handleDataID(res)
      }
    }).catch((err) => {
      console.log("Error Steps", err); handlerSetModalErrorMissing("Error Steps");
      setModalLoadingFlag(false);
      handlerSetModalError()
    })


  }

  async function ingredientsForPostHandler() {

    return Promise.all(
      ingredientsList?.map((res, index) => {
        // console.log("res :", res, "index", index)
        const ingreVar = {
          id: res.id,
          units: [res.unit[0]],
          quantity: res.quantity,
          ingredientName: [res.ingredient[0]],
          position: index + 1,
        }
        if (res.statusDelete === true && Number.isInteger(res.id)) {
          return (deleteIngredients.mutateAsync(ingreVar.id))
        }
        if (Number.isInteger(res.id)) {
          return putIngredients.mutateAsync(ingreVar)
        }
        if (!Number.isInteger(res.id) && res.statusDelete === true) { return { status: 204 } }
        else {
          return ingredientsCheckPost(ingreVar)
        }
      })
    ).then(res => {
      return {
        status: "fullfilled",
        value: handleDataID(res)
      }
    })
      .catch((err) => {
        console.log("Error Ingredients", err);
        handlerSetModalErrorMissing("Error Ingredients");
        setModalLoadingFlag(false);
        handlerSetModalError()
      })


  }


  async function imagiesForPostHandler(food) {

    const date = new Date(food.date).toISOString().substring(0, 10)
    const seconds = new Date(food.date).getUTCMilliseconds()


    return Promise.all(
      imageURLsList?.map((res, index) => {

        const imageID = res.id
        let form = new FormData();
        form.append("upload_folder", `${food.name}-${date}-${seconds}`);
        form.append("position", index + 1);

        let formdata = new FormData();
        formdata.append("upload_folder", `${food.name}-${date}-${seconds}`);
        formdata.append("image", res.imageForBackEnd);
        formdata.append("position", index + 1);

        const formdataPut = {
          id: imageID,
          imageForm: form
        }
    

        if (Number.isInteger(res.id) && res.statusDelete === true) {
          return deleteImagefood.mutateAsync(formdataPut)
        }
        if (!Number.isInteger(res.id) && res.statusDelete === false) {
          return postImagefood.mutateAsync({ formdata })
        }
        if (!Number.isInteger(res.id) && res.statusDelete === true) { return { status: 204 } }
        if (Number.isInteger(res.id)) {
          return putImagefood.mutateAsync(formdataPut)
        }

      })
    ).then(res => {
  
      return {
        status: "fullfilled",
        value: handleDataID(res)
      }
    }).catch((err) => {
      console.log("Error Imagies", err); handlerSetModalErrorMissing("Error Imagies");
      setModalLoadingFlag(false);
      handlerSetModalError()
    })

  }


  async function makeFoodRecord(food) {
    setModalLoadingFlag(true)
    const stepsRun = stepsForPostHandler()
    const ingredientsRun = ingredientsForPostHandler()
    const imagiesRun = imagiesForPostHandler(food)
    const urlRun = urlForPostHandler()

  
    const stepsRes = await stepsRun
    const ingredientsRes = await ingredientsRun
    const imagiesRes = await imagiesRun
    const urlRes = await urlRun


    Promise.all([stepsRes, ingredientsRes, imagiesRes, urlRes])
      .catch(err => {
        console.log("ERROR putFood can not be executed! Posssible Error in the following post function: Steps, Ingredients or Imagies", err);
        setModalLoadingFlag(false)
        handlerSetModalError()
      })
      .then(() => {
        putFood.mutate({
          ...food,
          steps: stepsRes.value,
          ingredients: ingredientsRes.value,
          images: imagiesRes.value,
          urls: urlRes.value,
        })
      }
      )
  }

  function foodDelete() {
    setModalDeleteFlag(false)
    setModalLoadingFlag(true)
    deleteFood.mutate({ id: foodID })
  }


  function imageURLsUpdater(imageURLsList) {
    setImageURLsList(imageURLsList);

  }

  function stepMove(move, step) {
    setStepsList(itemMove(move, step, stepsList))
  }

  function ingredientMove(move, ing) {
    setIngredientsList(itemMove(move, ing, ingredientsList))
  }

  function itemMove(move, item, array) {
    let position = getPosition(item.id, array)
    console.log("position :", position,
      "array.length :", array.length
    )
    let newArray = array.slice()
    if (move > 0) {
      if (position === (-1 + array.length)) { return newArray } else {
        newArray.splice(position, 1);
        newArray.splice(position + move, 0, item);
        return newArray
      }
    }
    if (move < 0) {
      if (position === 0) { return newArray }
      else {
        newArray.splice(position, 1);
        newArray.splice(position - 1, 0, item);
        return newArray
      }
    }
  }



  function handlerFoodSaveClose() {
    navigate(`/recepty/${ID}/`);
  }

  function handlerFoodDeleteCancel() {
    setModalDeleteFlag(false)
    navigate(`/recepty/uprava/${id.id}/`)
  }

  function handlerFoodDeleteConfirmed() {
    setModalSavedFlag(true)
    setTimeout(() => {
      setModalSavedFlag(false)
      navigate(`/recepty/?page_size=${20}`);
    }, 1000)
  }

  function handlerSetModalSave() {
    setModalSavedFlag(true)
    setTimeout(() => {
      setModalSavedFlag(false);
      navigate(`/recepty/${ID}/`);
    }, 1000)
  }
  function handlerSetModalError() {
    setModalErrorFlag(true)
    setTimeout(() => {
      setModalErrorFlag(false)
    }, 3000)
  }
  function handlerSetModalImageDeleteError() {
    setModalImageDeleteErrorFlag(true)
    setTimeout(() => {
      setModalImageDeleteErrorFlag(false)
    }, 3000)
  }

  function handlerSetModalErrorMissing(message) {
    setModalMessage(message)
    setTimeout(() => {
      setModalMessage("")
    }, 3000)
  }
  function closeModal(e) {
    setModalLightboxFlag(false)
    setIsVisibleEdit(false)
  }

  function getPosition(elementToFind, arrayElements) {

    let i;
    for (i = 0; i < arrayElements.length; i += 1) {
      if (arrayElements[i].id === elementToFind) {
        return i;
      }
    }
    return null;
  }

  const [imagePosition, setImagePosition] = useState("")
  function handlerImage(imageToAdd) {
    let position = getPosition(imageToAdd.id, imageURLsList)
    setImagePosition(position)
  }



  // images for Posting
  useEffect(() => {
    let newImageUrlsPost = imageURLsList.slice()
    let uniqueID = new Date().toISOString()

    if (images.length < 1) return;
    let position = imageURLsList.length + 1
    images.forEach(
      (image, index) => {
        newImageUrlsPost.push({
          id: `${uniqueID}${index}`,
          image: URL.createObjectURL(image),
          imageForBackEnd: image,
          position: position,
          statusDelete: false
        }); position++
      }, setImageURLsList(newImageUrlsPost)
    )

  }, [images]);


  function onImageChange(e) {
    setImages([...e.target.files]);
  }


  if (dataFoods.isLoading || dataFoodTags.isLoading || dataFoodsSteps.isLoading || dataIngredients.isLoading || dataIngredient.isLoading || dataUnit.isLoading || dataFoodsImage.isLoading || dataUrl.isLoading)
    return <label htmlFor="inpFile">
      <div className={style.loadingContainer}>
        <FontAwesomeIcon
          className={style.loadingIcon}
          icon={faSpinner}
          id="inpFileIcon"
          spin ></FontAwesomeIcon>
      </div>
    </label>//<h1>Loading...</h1> 
  // if (statusPostFood === 'error') return <h1>{JSON.stringify(errorFoods.message)}</h1>
  // if (statusImagefood === 'error') return <h1>{JSON.stringify(errorImagefood.message)}</h1>
  // if (statusFoodTags === 'error') return <h1>{JSON.stringify(errorFoodTags.message)}</h1>
  // if (stepsquery.statusError === 'error') return <h1>{JSON.stringify(errorSteps.message)}</h1>
  // if (statusIngredients === 'error') return <h1>{JSON.stringify(errorIngredients.message)}</h1>
  // if (statusIngredient === 'error') return <h1>{JSON.stringify(errorIngredient.message)}</h1>
  // if (statusUnit === 'error') return <h1>{JSON.stringify(errorUnit.message)}</h1>
  // if (loadingFood || loadingFoodTags || loadingSteps || loadingIngredients || loadingIngredient || loadingUnit || loadingImageFood) return <h1>return Loading...</h1>
  return (<>

    <div className={style.main}>
      <div className={style.header}>RECEPT</div>
      <div className={style.boxcontainer}>
        <div className={style.messagebox}>
          {modalMessage}</div>
        
        <div className={style.buttonBox} >
  
          <div className={style.foodButton} id={style.foodButtonSave}
          // datatooltip="Uloziť"
          >
            <FontAwesomeIcon
              onClick={handleFoodSave}
              icon={faCartPlus}

            />
          </div>
          {/* <div className={style.foodButton} onClick={handleFoodSave}>
                  ULOŽIŤ
                </div> */}

          <div className={style.foodButtonDelete}
          // datatooltip="Vymazať"
          >
            <FontAwesomeIcon
              // className={style.deleteIcon}
              icon={faTrash}
              onClick={handleFoodDelete}
            /></div>
          {/* <div className={style.foodButton} onClick={handleFoodDelete}>
                          VYMAZAŤ
                        </div> */}
          <div className={style.foodButton}
          // datatooltip="Spať"
          >
            <FontAwesomeIcon
              onClick={handlerFoodSaveClose}
              icon={faBackward}

            />
          </div>
         
        {/* <div className={style.foodButton} onClick={handlerFoodSaveClose}>
          SPÄŤ
        </div> */}
      </div>
      </div>
      <div className={style.fooodbox} >
        <LeftPanelFilter
          onFoodTagSet={foodTagSet}
          handleAddTagToFoodTagsList={foodTagSetCheck}
          // handleAddTagToFoodTagsList2={foodTagListCheck2}
          foodTagsBox={null}
          component={component}
        />

        {/* <div className={style.ingreProcedureBox}> */}

        <div className={style.secondColumn}>
          {/* <div className={style.Content_Flex}> */}
          {/* </div> */}
          <div className={style.ingredients}>
            <p>Suroviny:</p>
            <IngredientInput
              addToIngredientList={addToIngredientList}
              ingredientMove={ingredientMove}
              ingredientsList={ingredientsList}
              handlerSetModalErrorMissing={handlerSetModalErrorMissing}
              removeFromIngredientList={makeIngredientsDelete}
              component={component}
            ></IngredientInput>
          </div>
          {/* <div className={style.images} id="imagePreview">
                {imagePreview}
                <span className={style.imagePreview__defaultText}>
                  Image Preview
                </span>
              </div> */}

          <input
            // className={style.imageinput}
            className={style.imageinput}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif"
            id="inpFile"
            // id="image-input"
            onChange={onImageChange}
            display="none"
          />
          <div className={style.imageIconBox}>
            <label htmlFor="inpFile" className={style.imageIcon}
              datatooltip="Pridať fotografiu">
              <FontAwesomeIcon

                icon={faCircleArrowUp}
                // onClick={props.onTagDelete}
                id="inpFileIcon"
              ></FontAwesomeIcon>
            </label>
          </div>
          {!imageURLsList && <p className={style.numOfFiles} id="numOfFiles">
            No Files chosen
          </p>}
          <div className={style.imagebox}>
            <Image visible={imageFlag} imageURLs={imageURLsList} setModalFlag={setModalLightboxFlag} handlerImage={handlerImage}></Image>
          </div>
        </div>
        <div className={style.thirdColumn}>

          <div className={style.urlName}>
            <p>URL :</p>
          </div>
          <UrlInput
            urlList={urlList}
            component={component}
            deleteUrl={makeUrlToDelete}
            updateUrlList={updateUrlList}
            handleAddUrl={handleAddUrl}
          >

          </UrlInput>
          {/* <label htmlFor="url">URL:</label>
              <input
                className={style.foodurl}
                value={url}
                type="url"
                maxLength="25"
                id="url"
                onChange={handleNameChange}
                onClick={handleAddToNameTagList}
              /> */}
          <div className={style.urlName}>
            <p>Postup :</p>
          </div>
          <StepsInput
            stepMove={stepMove}
            handleAddStep={handleAddStep}
            updateStepList={updateStepList}
            stepsList={stepsList}
            stepsSetIDState={stepsList.id}
            deleteStep={makeSteptoDelete}
            component={component}
          ></StepsInput>
        </div>
        <div className={style.fooodnamebox} >
        <div className={style.name}>
            Nazov:
          </div>
        <input
          className={style.foodname}
          value={name}
          type="text"
          maxLength="300"
          onChange={handleNameChange}
        // onClick={handleAddToNameTagList}
        />
                <div className={style.name}>
       
          </div>
        </div>
        <div className={style.date}>
          Vytvorené:{newdate}
        </div>
        {/* </div> */}

      </div>
    </div>
    <Modal visible={modalLoadingFlag} setModalFlag={setModalLoadingFlag}>
      <SaveLoading
      ></SaveLoading>
    </Modal>
    <Modal visible={modalSavedFlag} setModalFlag={setModalSavedFlag}>
      <SaveSaved
      ></SaveSaved>
    </Modal>
    <Modal visible={modalDeleteFlag} setModalFlag={setModalDeleteFlag}>
      <DeleteConfirm
        foodDelete={foodDelete}
        handlerFoodDeleteCancel={handlerFoodDeleteCancel}></DeleteConfirm>
    </Modal>
    <Modal visible={modalErrorFlag} setModalFlag={setModalErrorFlag}>
      <SaveError
      ></SaveError>
    </Modal>
    <Modal visible={modalSaveErrorMissingFlag} setModalFlag={setModalSaveErrorMissingFlag}>
      <SaveErrorMissing
        modalMessage={modalMessage} />

    </Modal>
    <ModalPreview visible={modalLightboxFlag} setModalFlag={setModalLightboxFlag}>
      <Lightbox
        imageURLsList={[imageURLsList, setImageURLsList]}
        closeModal={closeModal}
        handlerImage={handlerImage}
        getPosition={getPosition}
        modalImageDeleteErrorFlag={modalImageDeleteErrorFlag}
        isVisibleEdit={[isVisibleEdit, setIsVisibleEdit]}
        imagePosition={[imagePosition, setImagePosition]}
        imageURLsUpdater={imageURLsUpdater}
        putImagefood={putImagefood}
        // imageDisplayChange={imageDisplayChange}

        component={component}
      >
      </Lightbox>
    </ModalPreview>

  </>
  )
}
export default EditFood;
