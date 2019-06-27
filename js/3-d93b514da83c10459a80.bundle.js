(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{3252:function(module,__webpack_exports__,__webpack_require__){"use strict";eval('/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);\n\n// function getFeatureEntry<C extends null, A extends null, S extends null>(\n//   containers: C, actions: A, selectors: S, redux?: IReduxEntry): ResultEntry<{}, {}, {}>;\nfunction makeFeatureEntry(containers, actions, selectors, redux) {\n    return tslib__WEBPACK_IMPORTED_MODULE_0__[/* __assign */ "a"]({ actions: actions, selectors: selectors, containers: containers }, redux);\n}\n/* harmony default export */ __webpack_exports__["a"] = (makeFeatureEntry);\n\n\n//# sourceURL=webpack:///./shared/helpers/makeFeatureEntry.ts?')},3256:function(module,__webpack_exports__,__webpack_require__){"use strict";eval('__webpack_require__.r(__webpack_exports__);\nvar containers_namespaceObject = {};\n__webpack_require__.r(containers_namespaceObject);\n__webpack_require__.d(containers_namespaceObject, "RequestDepositButton", function() { return RequestDepositButton_RequestDepositButton; });\n\n// EXTERNAL MODULE: ./shared/helpers/makeFeatureEntry.ts\nvar makeFeatureEntry = __webpack_require__(3252);\n\n// EXTERNAL MODULE: ../node_modules/react/index.js\nvar react = __webpack_require__(0);\n\n// EXTERNAL MODULE: ./services/i18n/index.ts + 16 modules\nvar i18n = __webpack_require__(8);\n\n// EXTERNAL MODULE: ./shared/view/elements/index.ts + 56 modules\nvar view_elements = __webpack_require__(4);\n\n// EXTERNAL MODULE: ./shared/view/components/index.ts + 27 modules\nvar components = __webpack_require__(79);\n\n// EXTERNAL MODULE: ./shared/view/elements/Icons/index.ts + 36 modules\nvar Icons = __webpack_require__(27);\n\n// EXTERNAL MODULE: ./shared/helpers/useModalHandlers.ts\nvar useModalHandlers = __webpack_require__(813);\n\n// EXTERNAL MODULE: ./services/daoApi/index.ts + 12 modules\nvar services_daoApi = __webpack_require__(80);\n\n// EXTERNAL MODULE: ./shared/validators/index.ts + 11 modules\nvar validators = __webpack_require__(97);\n\n// EXTERNAL MODULE: ./shared/view/form/index.ts + 9 modules\nvar view_form = __webpack_require__(379);\n\n// EXTERNAL MODULE: ./shared/helpers/makeAsyncSubmit.ts\nvar makeAsyncSubmit = __webpack_require__(812);\n\n// EXTERNAL MODULE: ./shared/styles/index.ts + 2 modules\nvar styles = __webpack_require__(12);\n\n// EXTERNAL MODULE: ./shared/helpers/style/index.ts + 3 modules\nvar style = __webpack_require__(3);\n\n// CONCATENATED MODULE: ./features/requestDeposit/view/containers/RequestDepositForm/RequestDepositForm.style.tsx\n\n\nvar RequestDepositForm_style_styles = function (_a) {\n    var theme = _a.extra;\n    return ({\n        buttonIcon: Object(style["b" /* rule */])({\n            marginRight: theme.spacing.unit,\n        }),\n        hint: Object(style["b" /* rule */])({\n            padding: theme.spacing.unit * 2,\n            borderRadius: \'0.25rem\',\n            backgroundColor: theme.colors.whiteLilac,\n        }),\n    });\n};\nvar provideStyles = Object(styles["c" /* withStyles */])(RequestDepositForm_style_styles);\n\n// CONCATENATED MODULE: ./features/requestDeposit/view/containers/RequestDepositForm/RequestDepositForm.tsx\n\n\n\n\n\n\n\n\n\n\nvar fieldNames = {\n    amount: \'amount\',\n};\nvar tKeys = i18n["d" /* tKeys */].features.requestDeposit;\nfunction RequestDepositForm(props) {\n    var onSuccess = props.onSuccess, onError = props.onError, onCancel = props.onCancel, classes = props.classes;\n    var t = Object(i18n["e" /* useTranslate */])().t;\n    var daoApi = Object(services_daoApi["e" /* useDaoApi */])();\n    var asyncSubmit = Object(makeAsyncSubmit["a" /* makeAsyncSubmit */])(function (_a) {\n        var amount = _a.amount;\n        return daoApi.deposit(amount);\n    }, onSuccess, onError);\n    // tslint:disable:jsx-key\n    var formFields = [\n        (react["createElement"](view_form["a" /* NumberInputField */], { suffix: " DAI", name: fieldNames.amount, label: t(tKeys.fields.amount.getKey()), validate: validators["c" /* isRequired */], fullWidth: true })),\n        (react["createElement"]("div", { className: classes.hint },\n            react["createElement"](view_elements["E" /* Typography */], null, t(tKeys.form.hint.getKey())))),\n    ];\n    // tslint:enable:jsx-key\n    return (react["createElement"](components["g" /* RequestForm */], { onCancel: onCancel, onSubmit: asyncSubmit, cancelButton: t(tKeys.form.cancel.getKey()), submitButton: react["createElement"](react["Fragment"], null,\n            react["createElement"](Icons["m" /* Deposit */], { className: classes.buttonIcon }),\n            t(tKeys.form.submit.getKey())), fields: formFields }));\n}\n/* harmony default export */ var RequestDepositForm_RequestDepositForm = (provideStyles(RequestDepositForm));\n\n// CONCATENATED MODULE: ./features/requestDeposit/view/containers/RequestDepositButton/RequestDepositButton.style.tsx\n\n\nvar RequestDepositButton_style_styles = function (_a) {\n    var theme = _a.extra;\n    return ({\n        buttonIcon: Object(style["b" /* rule */])({\n            marginRight: theme.spacing.unit,\n        }),\n    });\n};\nvar RequestDepositButton_style_provideStyles = Object(styles["c" /* withStyles */])(RequestDepositButton_style_styles);\n\n// CONCATENATED MODULE: ./features/requestDeposit/view/containers/RequestDepositButton/RequestDepositButton.tsx\n\n\n\n\n\n\n\n\nvar RequestDepositButton_tKeys = i18n["d" /* tKeys */].features.requestDeposit;\nfunction RequestDepositButton(props) {\n    var classes = props.classes;\n    var t = Object(i18n["e" /* useTranslate */])().t;\n    var _a = Object(useModalHandlers["a" /* useModalHandlers */])(), isOpened = _a.isOpened, error = _a.error, closeModal = _a.closeModal, openModal = _a.openModal, closeErrorModal = _a.closeErrorModal, onRetry = _a.onRetry, onError = _a.onError;\n    return (react["createElement"](react["Fragment"], null,\n        react["createElement"](view_elements["c" /* Button */], { variant: "contained", color: "secondary", onClick: openModal },\n            react["createElement"](Icons["m" /* Deposit */], { className: classes.buttonIcon }),\n            t(RequestDepositButton_tKeys.button.getKey())),\n        react["createElement"](components["e" /* Modal */], { size: "large", isOpen: isOpened && !error, title: t(RequestDepositButton_tKeys.form.title.getKey()), onClose: closeModal },\n            react["createElement"](RequestDepositForm_RequestDepositForm, { onSuccess: closeModal, onError: onError, onCancel: closeModal })),\n        react["createElement"](components["c" /* ErrorModal */], { isOpened: isOpened && !!error, onClose: closeErrorModal, onRetry: onRetry })));\n}\n/* harmony default export */ var RequestDepositButton_RequestDepositButton = (RequestDepositButton_style_provideStyles(RequestDepositButton));\n\n// CONCATENATED MODULE: ./features/requestDeposit/view/containers/index.ts\n\n\n// CONCATENATED MODULE: ./features/requestDeposit/entry.ts\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "entry", function() { return entry; });\n\n\nvar entry = Object(makeFeatureEntry["a" /* default */])(containers_namespaceObject, null, null);\n\n\n\n//# sourceURL=webpack:///./features/requestDeposit/entry.ts_+_5_modules?')}}]);