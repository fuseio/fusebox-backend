'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">fusebox-backend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AccountsModule.html" data-type="entity-link" >AccountsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AccountsModule-de79065b6b2e3f249e08c74b874df27d85a3cdec28e6aad19107120e91e0b062271492260fec321cb49b761bf6d8917d185df33ec1dd8b83fbec5e2b042f8ab4"' : 'data-bs-target="#xs-controllers-links-module-AccountsModule-de79065b6b2e3f249e08c74b874df27d85a3cdec28e6aad19107120e91e0b062271492260fec321cb49b761bf6d8917d185df33ec1dd8b83fbec5e2b042f8ab4"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AccountsModule-de79065b6b2e3f249e08c74b874df27d85a3cdec28e6aad19107120e91e0b062271492260fec321cb49b761bf6d8917d185df33ec1dd8b83fbec5e2b042f8ab4"' :
                                            'id="xs-controllers-links-module-AccountsModule-de79065b6b2e3f249e08c74b874df27d85a3cdec28e6aad19107120e91e0b062271492260fec321cb49b761bf6d8917d185df33ec1dd8b83fbec5e2b042f8ab4"' }>
                                            <li class="link">
                                                <a href="controllers/AccountsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccountsController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ApiKeyModule.html" data-type="entity-link" >ApiKeyModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ApiKeyModule-a1e3ec8b6786f32e4209162ce90c0dc004325b40f454764977bcd8141be48dcad32971389bf72ff0021cc2cdad8447b0a255d61e536efcc2d34b67be328105ad"' : 'data-bs-target="#xs-controllers-links-module-ApiKeyModule-a1e3ec8b6786f32e4209162ce90c0dc004325b40f454764977bcd8141be48dcad32971389bf72ff0021cc2cdad8447b0a255d61e536efcc2d34b67be328105ad"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ApiKeyModule-a1e3ec8b6786f32e4209162ce90c0dc004325b40f454764977bcd8141be48dcad32971389bf72ff0021cc2cdad8447b0a255d61e536efcc2d34b67be328105ad"' :
                                            'id="xs-controllers-links-module-ApiKeyModule-a1e3ec8b6786f32e4209162ce90c0dc004325b40f454764977bcd8141be48dcad32971389bf72ff0021cc2cdad8447b0a255d61e536efcc2d34b67be328105ad"' }>
                                            <li class="link">
                                                <a href="controllers/ApiKeysController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApiKeysController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ApiKeyModule-a1e3ec8b6786f32e4209162ce90c0dc004325b40f454764977bcd8141be48dcad32971389bf72ff0021cc2cdad8447b0a255d61e536efcc2d34b67be328105ad"' : 'data-bs-target="#xs-injectables-links-module-ApiKeyModule-a1e3ec8b6786f32e4209162ce90c0dc004325b40f454764977bcd8141be48dcad32971389bf72ff0021cc2cdad8447b0a255d61e536efcc2d34b67be328105ad"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ApiKeyModule-a1e3ec8b6786f32e4209162ce90c0dc004325b40f454764977bcd8141be48dcad32971389bf72ff0021cc2cdad8447b0a255d61e536efcc2d34b67be328105ad"' :
                                        'id="xs-injectables-links-module-ApiKeyModule-a1e3ec8b6786f32e4209162ce90c0dc004325b40f454764977bcd8141be48dcad32971389bf72ff0021cc2cdad8447b0a255d61e536efcc2d34b67be328105ad"' }>
                                        <li class="link">
                                            <a href="injectables/ApiKeysService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApiKeysService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ApiKeysModule.html" data-type="entity-link" >ApiKeysModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ApiKeysModule-53077cbd9e2c565c43a680b9deb4d0f14c61d2ae3e9e0a92c8a545fe72a6e7527e214c1462a62b2f83ff2a49dae65f71227634b4169c523754397b35eaa2b087"' : 'data-bs-target="#xs-controllers-links-module-ApiKeysModule-53077cbd9e2c565c43a680b9deb4d0f14c61d2ae3e9e0a92c8a545fe72a6e7527e214c1462a62b2f83ff2a49dae65f71227634b4169c523754397b35eaa2b087"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ApiKeysModule-53077cbd9e2c565c43a680b9deb4d0f14c61d2ae3e9e0a92c8a545fe72a6e7527e214c1462a62b2f83ff2a49dae65f71227634b4169c523754397b35eaa2b087"' :
                                            'id="xs-controllers-links-module-ApiKeysModule-53077cbd9e2c565c43a680b9deb4d0f14c61d2ae3e9e0a92c8a545fe72a6e7527e214c1462a62b2f83ff2a49dae65f71227634b4169c523754397b35eaa2b087"' }>
                                            <li class="link">
                                                <a href="controllers/ApiKeysController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApiKeysController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ApiKeysModule-53077cbd9e2c565c43a680b9deb4d0f14c61d2ae3e9e0a92c8a545fe72a6e7527e214c1462a62b2f83ff2a49dae65f71227634b4169c523754397b35eaa2b087"' : 'data-bs-target="#xs-injectables-links-module-ApiKeysModule-53077cbd9e2c565c43a680b9deb4d0f14c61d2ae3e9e0a92c8a545fe72a6e7527e214c1462a62b2f83ff2a49dae65f71227634b4169c523754397b35eaa2b087"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ApiKeysModule-53077cbd9e2c565c43a680b9deb4d0f14c61d2ae3e9e0a92c8a545fe72a6e7527e214c1462a62b2f83ff2a49dae65f71227634b4169c523754397b35eaa2b087"' :
                                        'id="xs-injectables-links-module-ApiKeysModule-53077cbd9e2c565c43a680b9deb4d0f14c61d2ae3e9e0a92c8a545fe72a6e7527e214c1462a62b2f83ff2a49dae65f71227634b4169c523754397b35eaa2b087"' }>
                                        <li class="link">
                                            <a href="injectables/ApiKeysService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApiKeysService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppStoreModule.html" data-type="entity-link" >AppStoreModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppStoreModule-a8f447c45bc1843c3d590f15efff8000f7b71d48a208aa33cc78be8701d316f13ff75ae1ef5094c91d01adab231ff50acafdf16c54a56c5c44de5299a8944ae2"' : 'data-bs-target="#xs-controllers-links-module-AppStoreModule-a8f447c45bc1843c3d590f15efff8000f7b71d48a208aa33cc78be8701d316f13ff75ae1ef5094c91d01adab231ff50acafdf16c54a56c5c44de5299a8944ae2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppStoreModule-a8f447c45bc1843c3d590f15efff8000f7b71d48a208aa33cc78be8701d316f13ff75ae1ef5094c91d01adab231ff50acafdf16c54a56c5c44de5299a8944ae2"' :
                                            'id="xs-controllers-links-module-AppStoreModule-a8f447c45bc1843c3d590f15efff8000f7b71d48a208aa33cc78be8701d316f13ff75ae1ef5094c91d01adab231ff50acafdf16c54a56c5c44de5299a8944ae2"' }>
                                            <li class="link">
                                                <a href="controllers/AppStoreController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppStoreController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppStoreModule-a8f447c45bc1843c3d590f15efff8000f7b71d48a208aa33cc78be8701d316f13ff75ae1ef5094c91d01adab231ff50acafdf16c54a56c5c44de5299a8944ae2"' : 'data-bs-target="#xs-injectables-links-module-AppStoreModule-a8f447c45bc1843c3d590f15efff8000f7b71d48a208aa33cc78be8701d316f13ff75ae1ef5094c91d01adab231ff50acafdf16c54a56c5c44de5299a8944ae2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppStoreModule-a8f447c45bc1843c3d590f15efff8000f7b71d48a208aa33cc78be8701d316f13ff75ae1ef5094c91d01adab231ff50acafdf16c54a56c5c44de5299a8944ae2"' :
                                        'id="xs-injectables-links-module-AppStoreModule-a8f447c45bc1843c3d590f15efff8000f7b71d48a208aa33cc78be8701d316f13ff75ae1ef5094c91d01adab231ff50acafdf16c54a56c5c44de5299a8944ae2"' }>
                                        <li class="link">
                                            <a href="injectables/AppStoreService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppStoreService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-7f7c36ace6ed7de668bd6302879dfc64e32d392f005b2150d06737929b20acb9b6b8a68b17f3fbbe229f6fb61b5cc2a9f1b2d133d95ebad061313c17e6be40ad"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-7f7c36ace6ed7de668bd6302879dfc64e32d392f005b2150d06737929b20acb9b6b8a68b17f3fbbe229f6fb61b5cc2a9f1b2d133d95ebad061313c17e6be40ad"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-7f7c36ace6ed7de668bd6302879dfc64e32d392f005b2150d06737929b20acb9b6b8a68b17f3fbbe229f6fb61b5cc2a9f1b2d133d95ebad061313c17e6be40ad"' :
                                            'id="xs-controllers-links-module-AuthModule-7f7c36ace6ed7de668bd6302879dfc64e32d392f005b2150d06737929b20acb9b6b8a68b17f3fbbe229f6fb61b5cc2a9f1b2d133d95ebad061313c17e6be40ad"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-7f7c36ace6ed7de668bd6302879dfc64e32d392f005b2150d06737929b20acb9b6b8a68b17f3fbbe229f6fb61b5cc2a9f1b2d133d95ebad061313c17e6be40ad"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-7f7c36ace6ed7de668bd6302879dfc64e32d392f005b2150d06737929b20acb9b6b8a68b17f3fbbe229f6fb61b5cc2a9f1b2d133d95ebad061313c17e6be40ad"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-7f7c36ace6ed7de668bd6302879dfc64e32d392f005b2150d06737929b20acb9b6b8a68b17f3fbbe229f6fb61b5cc2a9f1b2d133d95ebad061313c17e6be40ad"' :
                                        'id="xs-injectables-links-module-AuthModule-7f7c36ace6ed7de668bd6302879dfc64e32d392f005b2150d06737929b20acb9b6b8a68b17f3fbbe229f6fb61b5cc2a9f1b2d133d95ebad061313c17e6be40ad"' }>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/BroadcasterModule.html" data-type="entity-link" >BroadcasterModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-BroadcasterModule-890c8192066f74ce9e9f0f9117976dae4d74cdc9b0a6f5fa02bc81b0c95d0f7ab8ccb4d52607bff8d80fec2cef9d8abd64b65980ca3fd4740442ccbfd0bfa792"' : 'data-bs-target="#xs-injectables-links-module-BroadcasterModule-890c8192066f74ce9e9f0f9117976dae4d74cdc9b0a6f5fa02bc81b0c95d0f7ab8ccb4d52607bff8d80fec2cef9d8abd64b65980ca3fd4740442ccbfd0bfa792"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-BroadcasterModule-890c8192066f74ce9e9f0f9117976dae4d74cdc9b0a6f5fa02bc81b0c95d0f7ab8ccb4d52607bff8d80fec2cef9d8abd64b65980ca3fd4740442ccbfd0bfa792"' :
                                        'id="xs-injectables-links-module-BroadcasterModule-890c8192066f74ce9e9f0f9117976dae4d74cdc9b0a6f5fa02bc81b0c95d0f7ab8ccb4d52607bff8d80fec2cef9d8abd64b65980ca3fd4740442ccbfd0bfa792"' }>
                                        <li class="link">
                                            <a href="injectables/BroadcasterService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BroadcasterService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/WebhookSendService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WebhookSendService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/BundlerApiModule.html" data-type="entity-link" >BundlerApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-BundlerApiModule-834237cddb364618049bd415fd6b7642fce1666a2f55f9685a0374e80a20fa353b144046924d3c049b1b5856d146930a3711ac0629c7a0bb782f79cf89fb6b65"' : 'data-bs-target="#xs-controllers-links-module-BundlerApiModule-834237cddb364618049bd415fd6b7642fce1666a2f55f9685a0374e80a20fa353b144046924d3c049b1b5856d146930a3711ac0629c7a0bb782f79cf89fb6b65"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-BundlerApiModule-834237cddb364618049bd415fd6b7642fce1666a2f55f9685a0374e80a20fa353b144046924d3c049b1b5856d146930a3711ac0629c7a0bb782f79cf89fb6b65"' :
                                            'id="xs-controllers-links-module-BundlerApiModule-834237cddb364618049bd415fd6b7642fce1666a2f55f9685a0374e80a20fa353b144046924d3c049b1b5856d146930a3711ac0629c7a0bb782f79cf89fb6b65"' }>
                                            <li class="link">
                                                <a href="controllers/BundlerApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BundlerApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ChargeApiModule.html" data-type="entity-link" >ChargeApiModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ChargeApiModule-3fed38d8099e58c70738341bc7d15a667939dd570fcf878ff345ea92972bb4cb0314a9d3c6aecebcda873a4f8ba7c989b023e0a25b14a83acbace1c6f6672317"' : 'data-bs-target="#xs-injectables-links-module-ChargeApiModule-3fed38d8099e58c70738341bc7d15a667939dd570fcf878ff345ea92972bb4cb0314a9d3c6aecebcda873a4f8ba7c989b023e0a25b14a83acbace1c6f6672317"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ChargeApiModule-3fed38d8099e58c70738341bc7d15a667939dd570fcf878ff345ea92972bb4cb0314a9d3c6aecebcda873a4f8ba7c989b023e0a25b14a83acbace1c6f6672317"' :
                                        'id="xs-injectables-links-module-ChargeApiModule-3fed38d8099e58c70738341bc7d15a667939dd570fcf878ff345ea92972bb4cb0314a9d3c6aecebcda873a4f8ba7c989b023e0a25b14a83acbace1c6f6672317"' }>
                                        <li class="link">
                                            <a href="injectables/ChargeApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChargeApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ChargeApiServiceModule.html" data-type="entity-link" >ChargeApiServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ChargeApiServiceModule-4f1ef7208e76075947f77e7d19a0772450adc2f235e0996a4ad3115bee1bdf59ba816fb8bc2c57e9709bb5f2ac05e6f0bb477a3607f9f120197db79dcbadc88c"' : 'data-bs-target="#xs-controllers-links-module-ChargeApiServiceModule-4f1ef7208e76075947f77e7d19a0772450adc2f235e0996a4ad3115bee1bdf59ba816fb8bc2c57e9709bb5f2ac05e6f0bb477a3607f9f120197db79dcbadc88c"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ChargeApiServiceModule-4f1ef7208e76075947f77e7d19a0772450adc2f235e0996a4ad3115bee1bdf59ba816fb8bc2c57e9709bb5f2ac05e6f0bb477a3607f9f120197db79dcbadc88c"' :
                                            'id="xs-controllers-links-module-ChargeApiServiceModule-4f1ef7208e76075947f77e7d19a0772450adc2f235e0996a4ad3115bee1bdf59ba816fb8bc2c57e9709bb5f2ac05e6f0bb477a3607f9f120197db79dcbadc88c"' }>
                                            <li class="link">
                                                <a href="controllers/ChargeApiServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChargeApiServiceController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ChargeApiServiceModule-4f1ef7208e76075947f77e7d19a0772450adc2f235e0996a4ad3115bee1bdf59ba816fb8bc2c57e9709bb5f2ac05e6f0bb477a3607f9f120197db79dcbadc88c"' : 'data-bs-target="#xs-injectables-links-module-ChargeApiServiceModule-4f1ef7208e76075947f77e7d19a0772450adc2f235e0996a4ad3115bee1bdf59ba816fb8bc2c57e9709bb5f2ac05e6f0bb477a3607f9f120197db79dcbadc88c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ChargeApiServiceModule-4f1ef7208e76075947f77e7d19a0772450adc2f235e0996a4ad3115bee1bdf59ba816fb8bc2c57e9709bb5f2ac05e6f0bb477a3607f9f120197db79dcbadc88c"' :
                                        'id="xs-injectables-links-module-ChargeApiServiceModule-4f1ef7208e76075947f77e7d19a0772450adc2f235e0996a4ad3115bee1bdf59ba816fb8bc2c57e9709bb5f2ac05e6f0bb477a3607f9f120197db79dcbadc88c"' }>
                                        <li class="link">
                                            <a href="injectables/ChargeApiServiceService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChargeApiServiceService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ChargeAppsServiceModule.html" data-type="entity-link" >ChargeAppsServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ChargeAppsServiceModule-0c9f1267fa02db670f701281ac4e85742bb74ae74d3ef82f1b8b48a63daedd5cad7147131f2a90a359a7fb6856dbbf199d8a0d54dbeff5c7566bcfdb76c692fa"' : 'data-bs-target="#xs-controllers-links-module-ChargeAppsServiceModule-0c9f1267fa02db670f701281ac4e85742bb74ae74d3ef82f1b8b48a63daedd5cad7147131f2a90a359a7fb6856dbbf199d8a0d54dbeff5c7566bcfdb76c692fa"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ChargeAppsServiceModule-0c9f1267fa02db670f701281ac4e85742bb74ae74d3ef82f1b8b48a63daedd5cad7147131f2a90a359a7fb6856dbbf199d8a0d54dbeff5c7566bcfdb76c692fa"' :
                                            'id="xs-controllers-links-module-ChargeAppsServiceModule-0c9f1267fa02db670f701281ac4e85742bb74ae74d3ef82f1b8b48a63daedd5cad7147131f2a90a359a7fb6856dbbf199d8a0d54dbeff5c7566bcfdb76c692fa"' }>
                                            <li class="link">
                                                <a href="controllers/ChargeAppsServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChargeAppsServiceController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ChargeAppsServiceModule-0c9f1267fa02db670f701281ac4e85742bb74ae74d3ef82f1b8b48a63daedd5cad7147131f2a90a359a7fb6856dbbf199d8a0d54dbeff5c7566bcfdb76c692fa"' : 'data-bs-target="#xs-injectables-links-module-ChargeAppsServiceModule-0c9f1267fa02db670f701281ac4e85742bb74ae74d3ef82f1b8b48a63daedd5cad7147131f2a90a359a7fb6856dbbf199d8a0d54dbeff5c7566bcfdb76c692fa"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ChargeAppsServiceModule-0c9f1267fa02db670f701281ac4e85742bb74ae74d3ef82f1b8b48a63daedd5cad7147131f2a90a359a7fb6856dbbf199d8a0d54dbeff5c7566bcfdb76c692fa"' :
                                        'id="xs-injectables-links-module-ChargeAppsServiceModule-0c9f1267fa02db670f701281ac4e85742bb74ae74d3ef82f1b8b48a63daedd5cad7147131f2a90a359a7fb6856dbbf199d8a0d54dbeff5c7566bcfdb76c692fa"' }>
                                        <li class="link">
                                            <a href="injectables/ChargeAppsServiceService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChargeAppsServiceService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ChargeNetworkServiceModule.html" data-type="entity-link" >ChargeNetworkServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ChargeNetworkServiceModule-bd2a572841c87518815d29332ca4650f3f506f02fb8ccee8cd22331fdfc21c1976d743d5fc6f4fb5998b0d788d424488391409bc41dc2c26e5b7346e78f0bcaf"' : 'data-bs-target="#xs-controllers-links-module-ChargeNetworkServiceModule-bd2a572841c87518815d29332ca4650f3f506f02fb8ccee8cd22331fdfc21c1976d743d5fc6f4fb5998b0d788d424488391409bc41dc2c26e5b7346e78f0bcaf"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ChargeNetworkServiceModule-bd2a572841c87518815d29332ca4650f3f506f02fb8ccee8cd22331fdfc21c1976d743d5fc6f4fb5998b0d788d424488391409bc41dc2c26e5b7346e78f0bcaf"' :
                                            'id="xs-controllers-links-module-ChargeNetworkServiceModule-bd2a572841c87518815d29332ca4650f3f506f02fb8ccee8cd22331fdfc21c1976d743d5fc6f4fb5998b0d788d424488391409bc41dc2c26e5b7346e78f0bcaf"' }>
                                            <li class="link">
                                                <a href="controllers/ChargeNetworkServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChargeNetworkServiceController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ChargeNotificationsServiceModule.html" data-type="entity-link" >ChargeNotificationsServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ChargeNotificationsServiceModule-bb43a249fa58aaa96f58389ed4147278c84a79f943dbc21db8abc4f2dc508ac113a85aa939168ab6aa8782e5a2b388ace5e2e85cac584f11de104800b1880783"' : 'data-bs-target="#xs-controllers-links-module-ChargeNotificationsServiceModule-bb43a249fa58aaa96f58389ed4147278c84a79f943dbc21db8abc4f2dc508ac113a85aa939168ab6aa8782e5a2b388ace5e2e85cac584f11de104800b1880783"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ChargeNotificationsServiceModule-bb43a249fa58aaa96f58389ed4147278c84a79f943dbc21db8abc4f2dc508ac113a85aa939168ab6aa8782e5a2b388ace5e2e85cac584f11de104800b1880783"' :
                                            'id="xs-controllers-links-module-ChargeNotificationsServiceModule-bb43a249fa58aaa96f58389ed4147278c84a79f943dbc21db8abc4f2dc508ac113a85aa939168ab6aa8782e5a2b388ace5e2e85cac584f11de104800b1880783"' }>
                                            <li class="link">
                                                <a href="controllers/ChargeNotificationsServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChargeNotificationsServiceController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ChargeRelayServiceModule.html" data-type="entity-link" >ChargeRelayServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ChargeRelayServiceModule-cf287b081d4f55088202ae236d4115a4e8a7016d091d462aa597eeb9eaec0dc7244073027487e952377d057eacf790a315458573aafcfaf3a4833b24bd82db5f"' : 'data-bs-target="#xs-controllers-links-module-ChargeRelayServiceModule-cf287b081d4f55088202ae236d4115a4e8a7016d091d462aa597eeb9eaec0dc7244073027487e952377d057eacf790a315458573aafcfaf3a4833b24bd82db5f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ChargeRelayServiceModule-cf287b081d4f55088202ae236d4115a4e8a7016d091d462aa597eeb9eaec0dc7244073027487e952377d057eacf790a315458573aafcfaf3a4833b24bd82db5f"' :
                                            'id="xs-controllers-links-module-ChargeRelayServiceModule-cf287b081d4f55088202ae236d4115a4e8a7016d091d462aa597eeb9eaec0dc7244073027487e952377d057eacf790a315458573aafcfaf3a4833b24bd82db5f"' }>
                                            <li class="link">
                                                <a href="controllers/ChargeRelayServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChargeRelayServiceController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ChargeSmartWalletsServiceModule.html" data-type="entity-link" >ChargeSmartWalletsServiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ChargeSmartWalletsServiceModule-2ba8f520adc0b9266065bce34dd221f103d9ad4a57f8e869f90fa4f6d055cc5c1e81a94e68a25ac19ff4a53dfa7ea1c4b6c40c6ed3e673db0f43e7f84eea703d"' : 'data-bs-target="#xs-controllers-links-module-ChargeSmartWalletsServiceModule-2ba8f520adc0b9266065bce34dd221f103d9ad4a57f8e869f90fa4f6d055cc5c1e81a94e68a25ac19ff4a53dfa7ea1c4b6c40c6ed3e673db0f43e7f84eea703d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ChargeSmartWalletsServiceModule-2ba8f520adc0b9266065bce34dd221f103d9ad4a57f8e869f90fa4f6d055cc5c1e81a94e68a25ac19ff4a53dfa7ea1c4b6c40c6ed3e673db0f43e7f84eea703d"' :
                                            'id="xs-controllers-links-module-ChargeSmartWalletsServiceModule-2ba8f520adc0b9266065bce34dd221f103d9ad4a57f8e869f90fa4f6d055cc5c1e81a94e68a25ac19ff4a53dfa7ea1c4b6c40c6ed3e673db0f43e7f84eea703d"' }>
                                            <li class="link">
                                                <a href="controllers/ChargeSmartWalletsServiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChargeSmartWalletsServiceController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ConsensusApiModule.html" data-type="entity-link" >ConsensusApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ConsensusApiModule-84446f2649d490e9ff7e6abe719d408fc951e20a5b19970d828627197ed2cc1674e82960ba2026129351b1beacb02555899396f8d88da57c786b773f02811880"' : 'data-bs-target="#xs-controllers-links-module-ConsensusApiModule-84446f2649d490e9ff7e6abe719d408fc951e20a5b19970d828627197ed2cc1674e82960ba2026129351b1beacb02555899396f8d88da57c786b773f02811880"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ConsensusApiModule-84446f2649d490e9ff7e6abe719d408fc951e20a5b19970d828627197ed2cc1674e82960ba2026129351b1beacb02555899396f8d88da57c786b773f02811880"' :
                                            'id="xs-controllers-links-module-ConsensusApiModule-84446f2649d490e9ff7e6abe719d408fc951e20a5b19970d828627197ed2cc1674e82960ba2026129351b1beacb02555899396f8d88da57c786b773f02811880"' }>
                                            <li class="link">
                                                <a href="controllers/ConsensusApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConsensusApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ConsensusApiModule-84446f2649d490e9ff7e6abe719d408fc951e20a5b19970d828627197ed2cc1674e82960ba2026129351b1beacb02555899396f8d88da57c786b773f02811880"' : 'data-bs-target="#xs-injectables-links-module-ConsensusApiModule-84446f2649d490e9ff7e6abe719d408fc951e20a5b19970d828627197ed2cc1674e82960ba2026129351b1beacb02555899396f8d88da57c786b773f02811880"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ConsensusApiModule-84446f2649d490e9ff7e6abe719d408fc951e20a5b19970d828627197ed2cc1674e82960ba2026129351b1beacb02555899396f8d88da57c786b773f02811880"' :
                                        'id="xs-injectables-links-module-ConsensusApiModule-84446f2649d490e9ff7e6abe719d408fc951e20a5b19970d828627197ed2cc1674e82960ba2026129351b1beacb02555899396f8d88da57c786b773f02811880"' }>
                                        <li class="link">
                                            <a href="injectables/ConsensusApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConsensusApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ConsensusModule.html" data-type="entity-link" >ConsensusModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ConsensusModule-5a6cedfc39af310441229dba9f8a8407845b28a93c9cf2845413fa084d68cfa657861492500b33fc74603dc95d08cd84987bf3fcf48d20492ae2f88ccc390047"' : 'data-bs-target="#xs-controllers-links-module-ConsensusModule-5a6cedfc39af310441229dba9f8a8407845b28a93c9cf2845413fa084d68cfa657861492500b33fc74603dc95d08cd84987bf3fcf48d20492ae2f88ccc390047"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ConsensusModule-5a6cedfc39af310441229dba9f8a8407845b28a93c9cf2845413fa084d68cfa657861492500b33fc74603dc95d08cd84987bf3fcf48d20492ae2f88ccc390047"' :
                                            'id="xs-controllers-links-module-ConsensusModule-5a6cedfc39af310441229dba9f8a8407845b28a93c9cf2845413fa084d68cfa657861492500b33fc74603dc95d08cd84987bf3fcf48d20492ae2f88ccc390047"' }>
                                            <li class="link">
                                                <a href="controllers/ConsensusController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConsensusController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ConsensusModule-5a6cedfc39af310441229dba9f8a8407845b28a93c9cf2845413fa084d68cfa657861492500b33fc74603dc95d08cd84987bf3fcf48d20492ae2f88ccc390047"' : 'data-bs-target="#xs-injectables-links-module-ConsensusModule-5a6cedfc39af310441229dba9f8a8407845b28a93c9cf2845413fa084d68cfa657861492500b33fc74603dc95d08cd84987bf3fcf48d20492ae2f88ccc390047"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ConsensusModule-5a6cedfc39af310441229dba9f8a8407845b28a93c9cf2845413fa084d68cfa657861492500b33fc74603dc95d08cd84987bf3fcf48d20492ae2f88ccc390047"' :
                                        'id="xs-injectables-links-module-ConsensusModule-5a6cedfc39af310441229dba9f8a8407845b28a93c9cf2845413fa084d68cfa657861492500b33fc74603dc95d08cd84987bf3fcf48d20492ae2f88ccc390047"' }>
                                        <li class="link">
                                            <a href="injectables/ConsensusService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConsensusService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DataLayerModule.html" data-type="entity-link" >DataLayerModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-DataLayerModule-b884c8eab9dd75898266528159ef05d94a0b81707b39438137cf4ec1fabedd80f9de77d38778ec6d3fc892d828345259444388b3d942e28aa675a92211bd3cc4"' : 'data-bs-target="#xs-controllers-links-module-DataLayerModule-b884c8eab9dd75898266528159ef05d94a0b81707b39438137cf4ec1fabedd80f9de77d38778ec6d3fc892d828345259444388b3d942e28aa675a92211bd3cc4"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-DataLayerModule-b884c8eab9dd75898266528159ef05d94a0b81707b39438137cf4ec1fabedd80f9de77d38778ec6d3fc892d828345259444388b3d942e28aa675a92211bd3cc4"' :
                                            'id="xs-controllers-links-module-DataLayerModule-b884c8eab9dd75898266528159ef05d94a0b81707b39438137cf4ec1fabedd80f9de77d38778ec6d3fc892d828345259444388b3d942e28aa675a92211bd3cc4"' }>
                                            <li class="link">
                                                <a href="controllers/DataLayerController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataLayerController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DataLayerModule-b884c8eab9dd75898266528159ef05d94a0b81707b39438137cf4ec1fabedd80f9de77d38778ec6d3fc892d828345259444388b3d942e28aa675a92211bd3cc4"' : 'data-bs-target="#xs-injectables-links-module-DataLayerModule-b884c8eab9dd75898266528159ef05d94a0b81707b39438137cf4ec1fabedd80f9de77d38778ec6d3fc892d828345259444388b3d942e28aa675a92211bd3cc4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DataLayerModule-b884c8eab9dd75898266528159ef05d94a0b81707b39438137cf4ec1fabedd80f9de77d38778ec6d3fc892d828345259444388b3d942e28aa675a92211bd3cc4"' :
                                        'id="xs-injectables-links-module-DataLayerModule-b884c8eab9dd75898266528159ef05d94a0b81707b39438137cf4ec1fabedd80f9de77d38778ec6d3fc892d828345259444388b3d942e28aa675a92211bd3cc4"' }>
                                        <li class="link">
                                            <a href="injectables/AnalyticsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnalyticsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DataLayerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataLayerService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SmartWalletsAAEventsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SmartWalletsAAEventsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TokenService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TokenService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TradeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TradeService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserOpFactory.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserOpFactory</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserOpParser.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserOpParser</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EthereumPaymentsModule.html" data-type="entity-link" >EthereumPaymentsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-EthereumPaymentsModule-b871b96770ba07ab6079bcccc5809e9bb017656367e69e31d8f1c7e7352a8ff5765cc81c331dddb92e289096910c2f3b7fa8193677a953e966f078c9fb95db3b"' : 'data-bs-target="#xs-controllers-links-module-EthereumPaymentsModule-b871b96770ba07ab6079bcccc5809e9bb017656367e69e31d8f1c7e7352a8ff5765cc81c331dddb92e289096910c2f3b7fa8193677a953e966f078c9fb95db3b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-EthereumPaymentsModule-b871b96770ba07ab6079bcccc5809e9bb017656367e69e31d8f1c7e7352a8ff5765cc81c331dddb92e289096910c2f3b7fa8193677a953e966f078c9fb95db3b"' :
                                            'id="xs-controllers-links-module-EthereumPaymentsModule-b871b96770ba07ab6079bcccc5809e9bb017656367e69e31d8f1c7e7352a8ff5765cc81c331dddb92e289096910c2f3b7fa8193677a953e966f078c9fb95db3b"' }>
                                            <li class="link">
                                                <a href="controllers/EthereumPaymentsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EthereumPaymentsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EthereumPaymentsModule-b871b96770ba07ab6079bcccc5809e9bb017656367e69e31d8f1c7e7352a8ff5765cc81c331dddb92e289096910c2f3b7fa8193677a953e966f078c9fb95db3b"' : 'data-bs-target="#xs-injectables-links-module-EthereumPaymentsModule-b871b96770ba07ab6079bcccc5809e9bb017656367e69e31d8f1c7e7352a8ff5765cc81c331dddb92e289096910c2f3b7fa8193677a953e966f078c9fb95db3b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EthereumPaymentsModule-b871b96770ba07ab6079bcccc5809e9bb017656367e69e31d8f1c7e7352a8ff5765cc81c331dddb92e289096910c2f3b7fa8193677a953e966f078c9fb95db3b"' :
                                        'id="xs-injectables-links-module-EthereumPaymentsModule-b871b96770ba07ab6079bcccc5809e9bb017656367e69e31d8f1c7e7352a8ff5765cc81c331dddb92e289096910c2f3b7fa8193677a953e966f078c9fb95db3b"' }>
                                        <li class="link">
                                            <a href="injectables/BackendWalletsEthereumService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BackendWalletsEthereumService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/EthereumPaymentsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EthereumPaymentsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/WebhookSendService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WebhookSendService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EventsScannerModule.html" data-type="entity-link" >EventsScannerModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EventsScannerModule-d1518cf6e1dd81abf78a3e2c514c5e9c34f0d60649d767a71313248625df9f9fc68a6a87f0e4b25c608beba3ab5890177202966a835c7a5839ab647f124ef286"' : 'data-bs-target="#xs-injectables-links-module-EventsScannerModule-d1518cf6e1dd81abf78a3e2c514c5e9c34f0d60649d767a71313248625df9f9fc68a6a87f0e4b25c608beba3ab5890177202966a835c7a5839ab647f124ef286"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EventsScannerModule-d1518cf6e1dd81abf78a3e2c514c5e9c34f0d60649d767a71313248625df9f9fc68a6a87f0e4b25c608beba3ab5890177202966a835c7a5839ab647f124ef286"' :
                                        'id="xs-injectables-links-module-EventsScannerModule-d1518cf6e1dd81abf78a3e2c514c5e9c34f0d60649d767a71313248625df9f9fc68a6a87f0e4b25c608beba3ab5890177202966a835c7a5839ab647f124ef286"' }>
                                        <li class="link">
                                            <a href="injectables/ERC20EventsScannerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ERC20EventsScannerService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GasService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GasService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserOpEventsScannerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserOpEventsScannerService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ExplorerApiModule.html" data-type="entity-link" >ExplorerApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ExplorerApiModule-6edba2be92f84d11a5922d5efe79ecbbcef57402323536b4d9f6843e1ab5406ed31b693a43565031b9fd140a224c25187104cedd1183de67b4f1d9a1cf99d252"' : 'data-bs-target="#xs-controllers-links-module-ExplorerApiModule-6edba2be92f84d11a5922d5efe79ecbbcef57402323536b4d9f6843e1ab5406ed31b693a43565031b9fd140a224c25187104cedd1183de67b4f1d9a1cf99d252"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ExplorerApiModule-6edba2be92f84d11a5922d5efe79ecbbcef57402323536b4d9f6843e1ab5406ed31b693a43565031b9fd140a224c25187104cedd1183de67b4f1d9a1cf99d252"' :
                                            'id="xs-controllers-links-module-ExplorerApiModule-6edba2be92f84d11a5922d5efe79ecbbcef57402323536b4d9f6843e1ab5406ed31b693a43565031b9fd140a224c25187104cedd1183de67b4f1d9a1cf99d252"' }>
                                            <li class="link">
                                                <a href="controllers/ExplorerApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExplorerApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/GraphqlAPIModule.html" data-type="entity-link" >GraphqlAPIModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-GraphqlAPIModule-55efb48741bcb9a3f204f027e175c8ba87acaf149ab45d5c6023f4d26eb1bb5f5367af8690cbb46a84ca3b3a23a5b9580bb3d62c4a9c677e7078760aa140bf30"' : 'data-bs-target="#xs-controllers-links-module-GraphqlAPIModule-55efb48741bcb9a3f204f027e175c8ba87acaf149ab45d5c6023f4d26eb1bb5f5367af8690cbb46a84ca3b3a23a5b9580bb3d62c4a9c677e7078760aa140bf30"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-GraphqlAPIModule-55efb48741bcb9a3f204f027e175c8ba87acaf149ab45d5c6023f4d26eb1bb5f5367af8690cbb46a84ca3b3a23a5b9580bb3d62c4a9c677e7078760aa140bf30"' :
                                            'id="xs-controllers-links-module-GraphqlAPIModule-55efb48741bcb9a3f204f027e175c8ba87acaf149ab45d5c6023f4d26eb1bb5f5367af8690cbb46a84ca3b3a23a5b9580bb3d62c4a9c677e7078760aa140bf30"' }>
                                            <li class="link">
                                                <a href="controllers/GraphqlAPIController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GraphqlAPIController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-GraphqlAPIModule-55efb48741bcb9a3f204f027e175c8ba87acaf149ab45d5c6023f4d26eb1bb5f5367af8690cbb46a84ca3b3a23a5b9580bb3d62c4a9c677e7078760aa140bf30"' : 'data-bs-target="#xs-injectables-links-module-GraphqlAPIModule-55efb48741bcb9a3f204f027e175c8ba87acaf149ab45d5c6023f4d26eb1bb5f5367af8690cbb46a84ca3b3a23a5b9580bb3d62c4a9c677e7078760aa140bf30"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-GraphqlAPIModule-55efb48741bcb9a3f204f027e175c8ba87acaf149ab45d5c6023f4d26eb1bb5f5367af8690cbb46a84ca3b3a23a5b9580bb3d62c4a9c677e7078760aa140bf30"' :
                                        'id="xs-injectables-links-module-GraphqlAPIModule-55efb48741bcb9a3f204f027e175c8ba87acaf149ab45d5c6023f4d26eb1bb5f5367af8690cbb46a84ca3b3a23a5b9580bb3d62c4a9c677e7078760aa140bf30"' }>
                                        <li class="link">
                                            <a href="injectables/GraphqlAPIService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GraphqlAPIService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/GraphqlModule.html" data-type="entity-link" >GraphqlModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-GraphqlModule-b693bf4b4f1ea9ac99b0141cf45cbe0ca1c8cd8bca004120e0f81a16d80e57dfc708060cc423ef3a101eac2bd43c2fa26fd5277229b230894196b993e3b38e0e"' : 'data-bs-target="#xs-controllers-links-module-GraphqlModule-b693bf4b4f1ea9ac99b0141cf45cbe0ca1c8cd8bca004120e0f81a16d80e57dfc708060cc423ef3a101eac2bd43c2fa26fd5277229b230894196b993e3b38e0e"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-GraphqlModule-b693bf4b4f1ea9ac99b0141cf45cbe0ca1c8cd8bca004120e0f81a16d80e57dfc708060cc423ef3a101eac2bd43c2fa26fd5277229b230894196b993e3b38e0e"' :
                                            'id="xs-controllers-links-module-GraphqlModule-b693bf4b4f1ea9ac99b0141cf45cbe0ca1c8cd8bca004120e0f81a16d80e57dfc708060cc423ef3a101eac2bd43c2fa26fd5277229b230894196b993e3b38e0e"' }>
                                            <li class="link">
                                                <a href="controllers/GraphqlController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GraphqlController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-GraphqlModule-b693bf4b4f1ea9ac99b0141cf45cbe0ca1c8cd8bca004120e0f81a16d80e57dfc708060cc423ef3a101eac2bd43c2fa26fd5277229b230894196b993e3b38e0e"' : 'data-bs-target="#xs-injectables-links-module-GraphqlModule-b693bf4b4f1ea9ac99b0141cf45cbe0ca1c8cd8bca004120e0f81a16d80e57dfc708060cc423ef3a101eac2bd43c2fa26fd5277229b230894196b993e3b38e0e"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-GraphqlModule-b693bf4b4f1ea9ac99b0141cf45cbe0ca1c8cd8bca004120e0f81a16d80e57dfc708060cc423ef3a101eac2bd43c2fa26fd5277229b230894196b993e3b38e0e"' :
                                        'id="xs-injectables-links-module-GraphqlModule-b693bf4b4f1ea9ac99b0141cf45cbe0ca1c8cd8bca004120e0f81a16d80e57dfc708060cc423ef3a101eac2bd43c2fa26fd5277229b230894196b993e3b38e0e"' }>
                                        <li class="link">
                                            <a href="injectables/GraphQLService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GraphQLService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/LegacyApiModule.html" data-type="entity-link" >LegacyApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-LegacyApiModule-50c5645598822399b460901a143314d79af7303b3ba44a0e363ab0d2c84c2cb821f83ec8ae13c78cd282b280cba23342faced7a9ae09baea9df7d2ef64d86536"' : 'data-bs-target="#xs-controllers-links-module-LegacyApiModule-50c5645598822399b460901a143314d79af7303b3ba44a0e363ab0d2c84c2cb821f83ec8ae13c78cd282b280cba23342faced7a9ae09baea9df7d2ef64d86536"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-LegacyApiModule-50c5645598822399b460901a143314d79af7303b3ba44a0e363ab0d2c84c2cb821f83ec8ae13c78cd282b280cba23342faced7a9ae09baea9df7d2ef64d86536"' :
                                            'id="xs-controllers-links-module-LegacyApiModule-50c5645598822399b460901a143314d79af7303b3ba44a0e363ab0d2c84c2cb821f83ec8ae13c78cd282b280cba23342faced7a9ae09baea9df7d2ef64d86536"' }>
                                            <li class="link">
                                                <a href="controllers/LegacyAdminApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LegacyAdminApiController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/LegacyJobsApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LegacyJobsApiController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/LegacyTradeApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LegacyTradeApiController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/LegacyWalletApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LegacyWalletApiController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/TradeApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TradeApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationsModule.html" data-type="entity-link" >NotificationsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-NotificationsModule-b4a778352d5d6e283b4ab9945de82a2dfe47a17f5a9d306c84fcb11c2ef0f2a9d8f36c4e5a7a8a702cc7312586c0b4a5c91771865b4e7e52330b02ae5114142d"' : 'data-bs-target="#xs-controllers-links-module-NotificationsModule-b4a778352d5d6e283b4ab9945de82a2dfe47a17f5a9d306c84fcb11c2ef0f2a9d8f36c4e5a7a8a702cc7312586c0b4a5c91771865b4e7e52330b02ae5114142d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-NotificationsModule-b4a778352d5d6e283b4ab9945de82a2dfe47a17f5a9d306c84fcb11c2ef0f2a9d8f36c4e5a7a8a702cc7312586c0b4a5c91771865b4e7e52330b02ae5114142d"' :
                                            'id="xs-controllers-links-module-NotificationsModule-b4a778352d5d6e283b4ab9945de82a2dfe47a17f5a9d306c84fcb11c2ef0f2a9d8f36c4e5a7a8a702cc7312586c0b4a5c91771865b4e7e52330b02ae5114142d"' }>
                                            <li class="link">
                                                <a href="controllers/NotificationsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-NotificationsModule-b4a778352d5d6e283b4ab9945de82a2dfe47a17f5a9d306c84fcb11c2ef0f2a9d8f36c4e5a7a8a702cc7312586c0b4a5c91771865b4e7e52330b02ae5114142d"' : 'data-bs-target="#xs-injectables-links-module-NotificationsModule-b4a778352d5d6e283b4ab9945de82a2dfe47a17f5a9d306c84fcb11c2ef0f2a9d8f36c4e5a7a8a702cc7312586c0b4a5c91771865b4e7e52330b02ae5114142d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NotificationsModule-b4a778352d5d6e283b4ab9945de82a2dfe47a17f5a9d306c84fcb11c2ef0f2a9d8f36c4e5a7a8a702cc7312586c0b4a5c91771865b4e7e52330b02ae5114142d"' :
                                        'id="xs-injectables-links-module-NotificationsModule-b4a778352d5d6e283b4ab9945de82a2dfe47a17f5a9d306c84fcb11c2ef0f2a9d8f36c4e5a7a8a702cc7312586c0b4a5c91771865b4e7e52330b02ae5114142d"' }>
                                        <li class="link">
                                            <a href="injectables/NotificationsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OperatorsModule.html" data-type="entity-link" >OperatorsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-OperatorsModule-c455fc0f36f4c48321f01289ebdfb26decee9851b7c0d9f358c75705af0074ed75862d4c3acdfd828e6ac3d52128e3ba7883f3e4a50a6841193cf5da2f459767"' : 'data-bs-target="#xs-controllers-links-module-OperatorsModule-c455fc0f36f4c48321f01289ebdfb26decee9851b7c0d9f358c75705af0074ed75862d4c3acdfd828e6ac3d52128e3ba7883f3e4a50a6841193cf5da2f459767"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OperatorsModule-c455fc0f36f4c48321f01289ebdfb26decee9851b7c0d9f358c75705af0074ed75862d4c3acdfd828e6ac3d52128e3ba7883f3e4a50a6841193cf5da2f459767"' :
                                            'id="xs-controllers-links-module-OperatorsModule-c455fc0f36f4c48321f01289ebdfb26decee9851b7c0d9f358c75705af0074ed75862d4c3acdfd828e6ac3d52128e3ba7883f3e4a50a6841193cf5da2f459767"' }>
                                            <li class="link">
                                                <a href="controllers/OperatorsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OperatorsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OperatorsModule-c455fc0f36f4c48321f01289ebdfb26decee9851b7c0d9f358c75705af0074ed75862d4c3acdfd828e6ac3d52128e3ba7883f3e4a50a6841193cf5da2f459767"' : 'data-bs-target="#xs-injectables-links-module-OperatorsModule-c455fc0f36f4c48321f01289ebdfb26decee9851b7c0d9f358c75705af0074ed75862d4c3acdfd828e6ac3d52128e3ba7883f3e4a50a6841193cf5da2f459767"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OperatorsModule-c455fc0f36f4c48321f01289ebdfb26decee9851b7c0d9f358c75705af0074ed75862d4c3acdfd828e6ac3d52128e3ba7883f3e4a50a6841193cf5da2f459767"' :
                                        'id="xs-injectables-links-module-OperatorsModule-c455fc0f36f4c48321f01289ebdfb26decee9851b7c0d9f358c75705af0074ed75862d4c3acdfd828e6ac3d52128e3ba7883f3e4a50a6841193cf5da2f459767"' }>
                                        <li class="link">
                                            <a href="injectables/AnalyticsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnalyticsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OperatorJwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OperatorJwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OperatorsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OperatorsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PaymasterApiModule.html" data-type="entity-link" >PaymasterApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PaymasterApiModule-1bdb11f568555fe862d1be6077abc3f7b42a32d760bd8d09981fcac2be5842e1098add1f9eaa06a90bba12ebf6c6f80a976aa1b98a2f138f7df630b609eeb58b"' : 'data-bs-target="#xs-controllers-links-module-PaymasterApiModule-1bdb11f568555fe862d1be6077abc3f7b42a32d760bd8d09981fcac2be5842e1098add1f9eaa06a90bba12ebf6c6f80a976aa1b98a2f138f7df630b609eeb58b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PaymasterApiModule-1bdb11f568555fe862d1be6077abc3f7b42a32d760bd8d09981fcac2be5842e1098add1f9eaa06a90bba12ebf6c6f80a976aa1b98a2f138f7df630b609eeb58b"' :
                                            'id="xs-controllers-links-module-PaymasterApiModule-1bdb11f568555fe862d1be6077abc3f7b42a32d760bd8d09981fcac2be5842e1098add1f9eaa06a90bba12ebf6c6f80a976aa1b98a2f138f7df630b609eeb58b"' }>
                                            <li class="link">
                                                <a href="controllers/PaymasterApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymasterApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PaymasterApiModule-1bdb11f568555fe862d1be6077abc3f7b42a32d760bd8d09981fcac2be5842e1098add1f9eaa06a90bba12ebf6c6f80a976aa1b98a2f138f7df630b609eeb58b"' : 'data-bs-target="#xs-injectables-links-module-PaymasterApiModule-1bdb11f568555fe862d1be6077abc3f7b42a32d760bd8d09981fcac2be5842e1098add1f9eaa06a90bba12ebf6c6f80a976aa1b98a2f138f7df630b609eeb58b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PaymasterApiModule-1bdb11f568555fe862d1be6077abc3f7b42a32d760bd8d09981fcac2be5842e1098add1f9eaa06a90bba12ebf6c6f80a976aa1b98a2f138f7df630b609eeb58b"' :
                                        'id="xs-injectables-links-module-PaymasterApiModule-1bdb11f568555fe862d1be6077abc3f7b42a32d760bd8d09981fcac2be5842e1098add1f9eaa06a90bba12ebf6c6f80a976aa1b98a2f138f7df630b609eeb58b"' }>
                                        <li class="link">
                                            <a href="injectables/PaymasterApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymasterApiService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserOpParser.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserOpParser</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PaymasterModule.html" data-type="entity-link" >PaymasterModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PaymasterModule-d07bf57544ec93b8f41ab317d258a00ee8833bb4410431dc77c321befc68e7f32a0b6e4c9b8197510c2f9807516c9b3d46beb318d360efad29ded3558274c232"' : 'data-bs-target="#xs-controllers-links-module-PaymasterModule-d07bf57544ec93b8f41ab317d258a00ee8833bb4410431dc77c321befc68e7f32a0b6e4c9b8197510c2f9807516c9b3d46beb318d360efad29ded3558274c232"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PaymasterModule-d07bf57544ec93b8f41ab317d258a00ee8833bb4410431dc77c321befc68e7f32a0b6e4c9b8197510c2f9807516c9b3d46beb318d360efad29ded3558274c232"' :
                                            'id="xs-controllers-links-module-PaymasterModule-d07bf57544ec93b8f41ab317d258a00ee8833bb4410431dc77c321befc68e7f32a0b6e4c9b8197510c2f9807516c9b3d46beb318d360efad29ded3558274c232"' }>
                                            <li class="link">
                                                <a href="controllers/PaymasterController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymasterController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PaymasterModule-d07bf57544ec93b8f41ab317d258a00ee8833bb4410431dc77c321befc68e7f32a0b6e4c9b8197510c2f9807516c9b3d46beb318d360efad29ded3558274c232"' : 'data-bs-target="#xs-injectables-links-module-PaymasterModule-d07bf57544ec93b8f41ab317d258a00ee8833bb4410431dc77c321befc68e7f32a0b6e4c9b8197510c2f9807516c9b3d46beb318d360efad29ded3558274c232"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PaymasterModule-d07bf57544ec93b8f41ab317d258a00ee8833bb4410431dc77c321befc68e7f32a0b6e4c9b8197510c2f9807516c9b3d46beb318d360efad29ded3558274c232"' :
                                        'id="xs-injectables-links-module-PaymasterModule-d07bf57544ec93b8f41ab317d258a00ee8833bb4410431dc77c321befc68e7f32a0b6e4c9b8197510c2f9807516c9b3d46beb318d360efad29ded3558274c232"' }>
                                        <li class="link">
                                            <a href="injectables/PaymasterService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymasterService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PaymentsModule.html" data-type="entity-link" >PaymentsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PaymentsModule-69c81043f94524314da631d8289be4e2845ac6996abc1a24cb12cb2f7ed7bd42e01fbd07927f40ef59d5fc4327007624e0db470715b5d8512283e4c1c263d12d"' : 'data-bs-target="#xs-controllers-links-module-PaymentsModule-69c81043f94524314da631d8289be4e2845ac6996abc1a24cb12cb2f7ed7bd42e01fbd07927f40ef59d5fc4327007624e0db470715b5d8512283e4c1c263d12d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PaymentsModule-69c81043f94524314da631d8289be4e2845ac6996abc1a24cb12cb2f7ed7bd42e01fbd07927f40ef59d5fc4327007624e0db470715b5d8512283e4c1c263d12d"' :
                                            'id="xs-controllers-links-module-PaymentsModule-69c81043f94524314da631d8289be4e2845ac6996abc1a24cb12cb2f7ed7bd42e01fbd07927f40ef59d5fc4327007624e0db470715b5d8512283e4c1c263d12d"' }>
                                            <li class="link">
                                                <a href="controllers/PaymentsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PaymentsModule-69c81043f94524314da631d8289be4e2845ac6996abc1a24cb12cb2f7ed7bd42e01fbd07927f40ef59d5fc4327007624e0db470715b5d8512283e4c1c263d12d"' : 'data-bs-target="#xs-injectables-links-module-PaymentsModule-69c81043f94524314da631d8289be4e2845ac6996abc1a24cb12cb2f7ed7bd42e01fbd07927f40ef59d5fc4327007624e0db470715b5d8512283e4c1c263d12d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PaymentsModule-69c81043f94524314da631d8289be4e2845ac6996abc1a24cb12cb2f7ed7bd42e01fbd07927f40ef59d5fc4327007624e0db470715b5d8512283e4c1c263d12d"' :
                                        'id="xs-injectables-links-module-PaymentsModule-69c81043f94524314da631d8289be4e2845ac6996abc1a24cb12cb2f7ed7bd42e01fbd07927f40ef59d5fc4327007624e0db470715b5d8512283e4c1c263d12d"' }>
                                        <li class="link">
                                            <a href="injectables/PaymentsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/WebhookSendService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WebhookSendService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProjectsModule.html" data-type="entity-link" >ProjectsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ProjectsModule-563b67d722489aefa263cb7acf9d3d4aa0fe156d665f9e619cc9b350c06f0d88b30da842510b3bf4800d19868f0ec1886500fc1fd33e6b8f876bef9fc9032607"' : 'data-bs-target="#xs-controllers-links-module-ProjectsModule-563b67d722489aefa263cb7acf9d3d4aa0fe156d665f9e619cc9b350c06f0d88b30da842510b3bf4800d19868f0ec1886500fc1fd33e6b8f876bef9fc9032607"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProjectsModule-563b67d722489aefa263cb7acf9d3d4aa0fe156d665f9e619cc9b350c06f0d88b30da842510b3bf4800d19868f0ec1886500fc1fd33e6b8f876bef9fc9032607"' :
                                            'id="xs-controllers-links-module-ProjectsModule-563b67d722489aefa263cb7acf9d3d4aa0fe156d665f9e619cc9b350c06f0d88b30da842510b3bf4800d19868f0ec1886500fc1fd33e6b8f876bef9fc9032607"' }>
                                            <li class="link">
                                                <a href="controllers/ProjectsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ProjectsModule-563b67d722489aefa263cb7acf9d3d4aa0fe156d665f9e619cc9b350c06f0d88b30da842510b3bf4800d19868f0ec1886500fc1fd33e6b8f876bef9fc9032607"' : 'data-bs-target="#xs-injectables-links-module-ProjectsModule-563b67d722489aefa263cb7acf9d3d4aa0fe156d665f9e619cc9b350c06f0d88b30da842510b3bf4800d19868f0ec1886500fc1fd33e6b8f876bef9fc9032607"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProjectsModule-563b67d722489aefa263cb7acf9d3d4aa0fe156d665f9e619cc9b350c06f0d88b30da842510b3bf4800d19868f0ec1886500fc1fd33e6b8f876bef9fc9032607"' :
                                        'id="xs-injectables-links-module-ProjectsModule-563b67d722489aefa263cb7acf9d3d4aa0fe156d665f9e619cc9b350c06f0d88b30da842510b3bf4800d19868f0ec1886500fc1fd33e6b8f876bef9fc9032607"' }>
                                        <li class="link">
                                            <a href="injectables/ProjectsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RelayAccountsModule.html" data-type="entity-link" >RelayAccountsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-RelayAccountsModule-7bfd8e2a46b4ab29e74adea4f19cffffdb6c4e2431e1159cb5fe12295f4ccb2f38dee3e87f60202a77f073453c96bbe94869b69679b734fb8575ed6ec598eaa9"' : 'data-bs-target="#xs-controllers-links-module-RelayAccountsModule-7bfd8e2a46b4ab29e74adea4f19cffffdb6c4e2431e1159cb5fe12295f4ccb2f38dee3e87f60202a77f073453c96bbe94869b69679b734fb8575ed6ec598eaa9"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-RelayAccountsModule-7bfd8e2a46b4ab29e74adea4f19cffffdb6c4e2431e1159cb5fe12295f4ccb2f38dee3e87f60202a77f073453c96bbe94869b69679b734fb8575ed6ec598eaa9"' :
                                            'id="xs-controllers-links-module-RelayAccountsModule-7bfd8e2a46b4ab29e74adea4f19cffffdb6c4e2431e1159cb5fe12295f4ccb2f38dee3e87f60202a77f073453c96bbe94869b69679b734fb8575ed6ec598eaa9"' }>
                                            <li class="link">
                                                <a href="controllers/RelayAccountsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RelayAccountsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RelayAccountsModule-7bfd8e2a46b4ab29e74adea4f19cffffdb6c4e2431e1159cb5fe12295f4ccb2f38dee3e87f60202a77f073453c96bbe94869b69679b734fb8575ed6ec598eaa9"' : 'data-bs-target="#xs-injectables-links-module-RelayAccountsModule-7bfd8e2a46b4ab29e74adea4f19cffffdb6c4e2431e1159cb5fe12295f4ccb2f38dee3e87f60202a77f073453c96bbe94869b69679b734fb8575ed6ec598eaa9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RelayAccountsModule-7bfd8e2a46b4ab29e74adea4f19cffffdb6c4e2431e1159cb5fe12295f4ccb2f38dee3e87f60202a77f073453c96bbe94869b69679b734fb8575ed6ec598eaa9"' :
                                        'id="xs-injectables-links-module-RelayAccountsModule-7bfd8e2a46b4ab29e74adea4f19cffffdb6c4e2431e1159cb5fe12295f4ccb2f38dee3e87f60202a77f073453c96bbe94869b69679b734fb8575ed6ec598eaa9"' }>
                                        <li class="link">
                                            <a href="injectables/RelayAccountsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RelayAccountsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SmartWalletsAPIModule.html" data-type="entity-link" >SmartWalletsAPIModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SmartWalletsAPIModule-ca282dd81bea7b7b5465dd342edef85cf3196073377432cc636e2acc6f76f9bab79f933ec22227db2d4544926d27c5da366812b78be1ce1d9edcd8a608c688ba"' : 'data-bs-target="#xs-controllers-links-module-SmartWalletsAPIModule-ca282dd81bea7b7b5465dd342edef85cf3196073377432cc636e2acc6f76f9bab79f933ec22227db2d4544926d27c5da366812b78be1ce1d9edcd8a608c688ba"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SmartWalletsAPIModule-ca282dd81bea7b7b5465dd342edef85cf3196073377432cc636e2acc6f76f9bab79f933ec22227db2d4544926d27c5da366812b78be1ce1d9edcd8a608c688ba"' :
                                            'id="xs-controllers-links-module-SmartWalletsAPIModule-ca282dd81bea7b7b5465dd342edef85cf3196073377432cc636e2acc6f76f9bab79f933ec22227db2d4544926d27c5da366812b78be1ce1d9edcd8a608c688ba"' }>
                                            <li class="link">
                                                <a href="controllers/SmartWalletsAPIController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SmartWalletsAPIController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/SmartWalletsAPIV2Controller.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SmartWalletsAPIV2Controller</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SmartWalletsAPIModule-ca282dd81bea7b7b5465dd342edef85cf3196073377432cc636e2acc6f76f9bab79f933ec22227db2d4544926d27c5da366812b78be1ce1d9edcd8a608c688ba"' : 'data-bs-target="#xs-injectables-links-module-SmartWalletsAPIModule-ca282dd81bea7b7b5465dd342edef85cf3196073377432cc636e2acc6f76f9bab79f933ec22227db2d4544926d27c5da366812b78be1ce1d9edcd8a608c688ba"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SmartWalletsAPIModule-ca282dd81bea7b7b5465dd342edef85cf3196073377432cc636e2acc6f76f9bab79f933ec22227db2d4544926d27c5da366812b78be1ce1d9edcd8a608c688ba"' :
                                        'id="xs-injectables-links-module-SmartWalletsAPIModule-ca282dd81bea7b7b5465dd342edef85cf3196073377432cc636e2acc6f76f9bab79f933ec22227db2d4544926d27c5da366812b78be1ce1d9edcd8a608c688ba"' }>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SmartWalletsAPIService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SmartWalletsAPIService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SmartWalletsModule.html" data-type="entity-link" >SmartWalletsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SmartWalletsModule-4a537300dcb86cb1c64d7108da8bd8a222240d255306b9cb33f33efa0a606dff266dc3274277cc3e1097aeed1a9e0940050cabba7ee0af56a09ae9febc650399"' : 'data-bs-target="#xs-controllers-links-module-SmartWalletsModule-4a537300dcb86cb1c64d7108da8bd8a222240d255306b9cb33f33efa0a606dff266dc3274277cc3e1097aeed1a9e0940050cabba7ee0af56a09ae9febc650399"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SmartWalletsModule-4a537300dcb86cb1c64d7108da8bd8a222240d255306b9cb33f33efa0a606dff266dc3274277cc3e1097aeed1a9e0940050cabba7ee0af56a09ae9febc650399"' :
                                            'id="xs-controllers-links-module-SmartWalletsModule-4a537300dcb86cb1c64d7108da8bd8a222240d255306b9cb33f33efa0a606dff266dc3274277cc3e1097aeed1a9e0940050cabba7ee0af56a09ae9febc650399"' }>
                                            <li class="link">
                                                <a href="controllers/SmartWalletsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SmartWalletsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SmartWalletsModule-4a537300dcb86cb1c64d7108da8bd8a222240d255306b9cb33f33efa0a606dff266dc3274277cc3e1097aeed1a9e0940050cabba7ee0af56a09ae9febc650399"' : 'data-bs-target="#xs-injectables-links-module-SmartWalletsModule-4a537300dcb86cb1c64d7108da8bd8a222240d255306b9cb33f33efa0a606dff266dc3274277cc3e1097aeed1a9e0940050cabba7ee0af56a09ae9febc650399"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SmartWalletsModule-4a537300dcb86cb1c64d7108da8bd8a222240d255306b9cb33f33efa0a606dff266dc3274277cc3e1097aeed1a9e0940050cabba7ee0af56a09ae9febc650399"' :
                                        'id="xs-injectables-links-module-SmartWalletsModule-4a537300dcb86cb1c64d7108da8bd8a222240d255306b9cb33f33efa0a606dff266dc3274277cc3e1097aeed1a9e0940050cabba7ee0af56a09ae9febc650399"' }>
                                        <li class="link">
                                            <a href="injectables/AnalyticsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnalyticsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RelayAPIService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RelayAPIService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SmartWalletsAAService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SmartWalletsAAService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SmartWalletsEventsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SmartWalletsEventsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SmartWalletsLegacyService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SmartWalletsLegacyService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TradeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TradeService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/StakingAPIModule.html" data-type="entity-link" >StakingAPIModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-StakingAPIModule-a748f29c1f002af178a61d805a66a2d894a4e0b5ebaa7125d047321c57c527f76424758de935a96cd3f42fb097fad1c2248cae11757db11b4de3591a272ff151"' : 'data-bs-target="#xs-controllers-links-module-StakingAPIModule-a748f29c1f002af178a61d805a66a2d894a4e0b5ebaa7125d047321c57c527f76424758de935a96cd3f42fb097fad1c2248cae11757db11b4de3591a272ff151"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-StakingAPIModule-a748f29c1f002af178a61d805a66a2d894a4e0b5ebaa7125d047321c57c527f76424758de935a96cd3f42fb097fad1c2248cae11757db11b4de3591a272ff151"' :
                                            'id="xs-controllers-links-module-StakingAPIModule-a748f29c1f002af178a61d805a66a2d894a4e0b5ebaa7125d047321c57c527f76424758de935a96cd3f42fb097fad1c2248cae11757db11b4de3591a272ff151"' }>
                                            <li class="link">
                                                <a href="controllers/StakingApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StakingApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StakingAPIModule-a748f29c1f002af178a61d805a66a2d894a4e0b5ebaa7125d047321c57c527f76424758de935a96cd3f42fb097fad1c2248cae11757db11b4de3591a272ff151"' : 'data-bs-target="#xs-injectables-links-module-StakingAPIModule-a748f29c1f002af178a61d805a66a2d894a4e0b5ebaa7125d047321c57c527f76424758de935a96cd3f42fb097fad1c2248cae11757db11b4de3591a272ff151"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StakingAPIModule-a748f29c1f002af178a61d805a66a2d894a4e0b5ebaa7125d047321c57c527f76424758de935a96cd3f42fb097fad1c2248cae11757db11b4de3591a272ff151"' :
                                        'id="xs-injectables-links-module-StakingAPIModule-a748f29c1f002af178a61d805a66a2d894a4e0b5ebaa7125d047321c57c527f76424758de935a96cd3f42fb097fad1c2248cae11757db11b4de3591a272ff151"' }>
                                        <li class="link">
                                            <a href="injectables/StakingAPIService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StakingAPIService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/StakingModule.html" data-type="entity-link" >StakingModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-StakingModule-041c11cc31d4921e01949423dcf3a2a5c9a7fbbef8352ae6d6d9e2d59a2d7e52584649aa4783958729ef592ddb7b39acda2f431cbfbc68c4286fbe364d938d7b"' : 'data-bs-target="#xs-controllers-links-module-StakingModule-041c11cc31d4921e01949423dcf3a2a5c9a7fbbef8352ae6d6d9e2d59a2d7e52584649aa4783958729ef592ddb7b39acda2f431cbfbc68c4286fbe364d938d7b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-StakingModule-041c11cc31d4921e01949423dcf3a2a5c9a7fbbef8352ae6d6d9e2d59a2d7e52584649aa4783958729ef592ddb7b39acda2f431cbfbc68c4286fbe364d938d7b"' :
                                            'id="xs-controllers-links-module-StakingModule-041c11cc31d4921e01949423dcf3a2a5c9a7fbbef8352ae6d6d9e2d59a2d7e52584649aa4783958729ef592ddb7b39acda2f431cbfbc68c4286fbe364d938d7b"' }>
                                            <li class="link">
                                                <a href="controllers/StakingController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StakingController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StakingModule-041c11cc31d4921e01949423dcf3a2a5c9a7fbbef8352ae6d6d9e2d59a2d7e52584649aa4783958729ef592ddb7b39acda2f431cbfbc68c4286fbe364d938d7b"' : 'data-bs-target="#xs-injectables-links-module-StakingModule-041c11cc31d4921e01949423dcf3a2a5c9a7fbbef8352ae6d6d9e2d59a2d7e52584649aa4783958729ef592ddb7b39acda2f431cbfbc68c4286fbe364d938d7b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StakingModule-041c11cc31d4921e01949423dcf3a2a5c9a7fbbef8352ae6d6d9e2d59a2d7e52584649aa4783958729ef592ddb7b39acda2f431cbfbc68c4286fbe364d938d7b"' :
                                        'id="xs-injectables-links-module-StakingModule-041c11cc31d4921e01949423dcf3a2a5c9a7fbbef8352ae6d6d9e2d59a2d7e52584649aa4783958729ef592ddb7b39acda2f431cbfbc68c4286fbe364d938d7b"' }>
                                        <li class="link">
                                            <a href="injectables/FuseLiquidStakingService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FuseLiquidStakingService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GraphService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GraphService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StakingService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StakingService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TradeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TradeService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/VoltBarService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VoltBarService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/StudioLegacyJwtModule.html" data-type="entity-link" >StudioLegacyJwtModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StudioLegacyJwtModule-fdd07c06f445f0da21b4acb98ced215468eb9d21fa115bc1b5c519c41b4e7b60ccc47b39b80126e728b4c3cb3ca481fd239ede900b540709387b4b80060c987c"' : 'data-bs-target="#xs-injectables-links-module-StudioLegacyJwtModule-fdd07c06f445f0da21b4acb98ced215468eb9d21fa115bc1b5c519c41b4e7b60ccc47b39b80126e728b4c3cb3ca481fd239ede900b540709387b4b80060c987c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StudioLegacyJwtModule-fdd07c06f445f0da21b4acb98ced215468eb9d21fa115bc1b5c519c41b4e7b60ccc47b39b80126e728b4c3cb3ca481fd239ede900b540709387b4b80060c987c"' :
                                        'id="xs-injectables-links-module-StudioLegacyJwtModule-fdd07c06f445f0da21b4acb98ced215468eb9d21fa115bc1b5c519c41b4e7b60ccc47b39b80126e728b4c3cb3ca481fd239ede900b540709387b4b80060c987c"' }>
                                        <li class="link">
                                            <a href="injectables/StudioLegacyJwtService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StudioLegacyJwtService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TransactionsScannerModule.html" data-type="entity-link" >TransactionsScannerModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TransactionsScannerModule-646d8974a4846f5bd5e812fb179d5764434abdfd61f111e6a4f041ba42ef4405db92c8e44222f477457b63d1348b85e31c2219c79057d63f3c0f047641a77a11"' : 'data-bs-target="#xs-injectables-links-module-TransactionsScannerModule-646d8974a4846f5bd5e812fb179d5764434abdfd61f111e6a4f041ba42ef4405db92c8e44222f477457b63d1348b85e31c2219c79057d63f3c0f047641a77a11"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TransactionsScannerModule-646d8974a4846f5bd5e812fb179d5764434abdfd61f111e6a4f041ba42ef4405db92c8e44222f477457b63d1348b85e31c2219c79057d63f3c0f047641a77a11"' :
                                        'id="xs-injectables-links-module-TransactionsScannerModule-646d8974a4846f5bd5e812fb179d5764434abdfd61f111e6a4f041ba42ef4405db92c8e44222f477457b63d1348b85e31c2219c79057d63f3c0f047641a77a11"' }>
                                        <li class="link">
                                            <a href="injectables/GasService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GasService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TransactionsScannerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TransactionsScannerService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-d6a4fe5c0019b60ad872644817fc6affab4277c885b7facdeff89e20cb018d1d7159fdfd65c80ffa035f2e5affaf432cc0c9e7175f0f0c6d49e3d97aa275e691"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-d6a4fe5c0019b60ad872644817fc6affab4277c885b7facdeff89e20cb018d1d7159fdfd65c80ffa035f2e5affaf432cc0c9e7175f0f0c6d49e3d97aa275e691"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-d6a4fe5c0019b60ad872644817fc6affab4277c885b7facdeff89e20cb018d1d7159fdfd65c80ffa035f2e5affaf432cc0c9e7175f0f0c6d49e3d97aa275e691"' :
                                            'id="xs-controllers-links-module-UsersModule-d6a4fe5c0019b60ad872644817fc6affab4277c885b7facdeff89e20cb018d1d7159fdfd65c80ffa035f2e5affaf432cc0c9e7175f0f0c6d49e3d97aa275e691"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-d6a4fe5c0019b60ad872644817fc6affab4277c885b7facdeff89e20cb018d1d7159fdfd65c80ffa035f2e5affaf432cc0c9e7175f0f0c6d49e3d97aa275e691"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-d6a4fe5c0019b60ad872644817fc6affab4277c885b7facdeff89e20cb018d1d7159fdfd65c80ffa035f2e5affaf432cc0c9e7175f0f0c6d49e3d97aa275e691"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-d6a4fe5c0019b60ad872644817fc6affab4277c885b7facdeff89e20cb018d1d7159fdfd65c80ffa035f2e5affaf432cc0c9e7175f0f0c6d49e3d97aa275e691"' :
                                        'id="xs-injectables-links-module-UsersModule-d6a4fe5c0019b60ad872644817fc6affab4277c885b7facdeff89e20cb018d1d7159fdfd65c80ffa035f2e5affaf432cc0c9e7175f0f0c6d49e3d97aa275e691"' }>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/WebhooksModule.html" data-type="entity-link" >WebhooksModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-WebhooksModule-d750f59c6d3ab8ebe90a8fcac8f216233d6f7d20d6fc17a8537e4a5a65cd8c0fc451b34f5ea3660ffefacbef30e76610543c6b96a4ff228d3faeec6eb3a4b5e8"' : 'data-bs-target="#xs-controllers-links-module-WebhooksModule-d750f59c6d3ab8ebe90a8fcac8f216233d6f7d20d6fc17a8537e4a5a65cd8c0fc451b34f5ea3660ffefacbef30e76610543c6b96a4ff228d3faeec6eb3a4b5e8"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-WebhooksModule-d750f59c6d3ab8ebe90a8fcac8f216233d6f7d20d6fc17a8537e4a5a65cd8c0fc451b34f5ea3660ffefacbef30e76610543c6b96a4ff228d3faeec6eb3a4b5e8"' :
                                            'id="xs-controllers-links-module-WebhooksModule-d750f59c6d3ab8ebe90a8fcac8f216233d6f7d20d6fc17a8537e4a5a65cd8c0fc451b34f5ea3660ffefacbef30e76610543c6b96a4ff228d3faeec6eb3a4b5e8"' }>
                                            <li class="link">
                                                <a href="controllers/WebhooksController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WebhooksController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-WebhooksModule-d750f59c6d3ab8ebe90a8fcac8f216233d6f7d20d6fc17a8537e4a5a65cd8c0fc451b34f5ea3660ffefacbef30e76610543c6b96a4ff228d3faeec6eb3a4b5e8"' : 'data-bs-target="#xs-injectables-links-module-WebhooksModule-d750f59c6d3ab8ebe90a8fcac8f216233d6f7d20d6fc17a8537e4a5a65cd8c0fc451b34f5ea3660ffefacbef30e76610543c6b96a4ff228d3faeec6eb3a4b5e8"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-WebhooksModule-d750f59c6d3ab8ebe90a8fcac8f216233d6f7d20d6fc17a8537e4a5a65cd8c0fc451b34f5ea3660ffefacbef30e76610543c6b96a4ff228d3faeec6eb3a4b5e8"' :
                                        'id="xs-injectables-links-module-WebhooksModule-d750f59c6d3ab8ebe90a8fcac8f216233d6f7d20d6fc17a8537e4a5a65cd8c0fc451b34f5ea3660ffefacbef30e76610543c6b96a4ff228d3faeec6eb3a4b5e8"' }>
                                        <li class="link">
                                            <a href="injectables/WebhooksService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WebhooksService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AccountsController.html" data-type="entity-link" >AccountsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ApiKeysController.html" data-type="entity-link" >ApiKeysController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ApiKeysController-1.html" data-type="entity-link" >ApiKeysController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AppStoreController.html" data-type="entity-link" >AppStoreController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/BundlerApiController.html" data-type="entity-link" >BundlerApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ChargeApiServiceController.html" data-type="entity-link" >ChargeApiServiceController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ChargeAppsServiceController.html" data-type="entity-link" >ChargeAppsServiceController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ChargeNetworkServiceController.html" data-type="entity-link" >ChargeNetworkServiceController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ChargeNotificationsServiceController.html" data-type="entity-link" >ChargeNotificationsServiceController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ChargeRelayServiceController.html" data-type="entity-link" >ChargeRelayServiceController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ChargeSmartWalletsServiceController.html" data-type="entity-link" >ChargeSmartWalletsServiceController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ConsensusApiController.html" data-type="entity-link" >ConsensusApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ConsensusController.html" data-type="entity-link" >ConsensusController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DataLayerController.html" data-type="entity-link" >DataLayerController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/EthereumPaymentsController.html" data-type="entity-link" >EthereumPaymentsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ExplorerApiController.html" data-type="entity-link" >ExplorerApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/GraphqlAPIController.html" data-type="entity-link" >GraphqlAPIController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/GraphqlController.html" data-type="entity-link" >GraphqlController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/LegacyAdminApiController.html" data-type="entity-link" >LegacyAdminApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/LegacyJobsApiController.html" data-type="entity-link" >LegacyJobsApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/LegacyTradeApiController.html" data-type="entity-link" >LegacyTradeApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/LegacyWalletApiController.html" data-type="entity-link" >LegacyWalletApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/NotificationsController.html" data-type="entity-link" >NotificationsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/OperatorsController.html" data-type="entity-link" >OperatorsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/PaymasterApiController.html" data-type="entity-link" >PaymasterApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/PaymasterController.html" data-type="entity-link" >PaymasterController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/PaymentsController.html" data-type="entity-link" >PaymentsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ProjectsController.html" data-type="entity-link" >ProjectsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/RelayAccountsController.html" data-type="entity-link" >RelayAccountsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/SmartWalletsAPIController.html" data-type="entity-link" >SmartWalletsAPIController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/SmartWalletsAPIV2Controller.html" data-type="entity-link" >SmartWalletsAPIV2Controller</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/SmartWalletsController.html" data-type="entity-link" >SmartWalletsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/StakingApiController.html" data-type="entity-link" >StakingApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/StakingController.html" data-type="entity-link" >StakingController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/TradeApiController.html" data-type="entity-link" >TradeApiController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UsersController.html" data-type="entity-link" >UsersController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/WebhooksController.html" data-type="entity-link" >WebhooksController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AllExceptionsFilter.html" data-type="entity-link" >AllExceptionsFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/ApiKeysDto.html" data-type="entity-link" >ApiKeysDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ApproveToken.html" data-type="entity-link" >ApproveToken</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthOperatorDto.html" data-type="entity-link" >AuthOperatorDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateEthereumPaymentLinkDto.html" data-type="entity-link" >CreateEthereumPaymentLinkDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateOperatorUserDto.html" data-type="entity-link" >CreateOperatorUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateOperatorWalletDto.html" data-type="entity-link" >CreateOperatorWalletDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePaymentLinkDto.html" data-type="entity-link" >CreatePaymentLinkDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProjectDto.html" data-type="entity-link" >CreateProjectDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateWebhookAddressesDto.html" data-type="entity-link" >CreateWebhookAddressesDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateWebhookDto.html" data-type="entity-link" >CreateWebhookDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DelegatedAmountsDto.html" data-type="entity-link" >DelegatedAmountsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ERC20Transfer.html" data-type="entity-link" >ERC20Transfer</a>
                            </li>
                            <li class="link">
                                <a href="classes/FuseLegacySDK.html" data-type="entity-link" >FuseLegacySDK</a>
                            </li>
                            <li class="link">
                                <a href="classes/LegacyEventEmitter.html" data-type="entity-link" >LegacyEventEmitter</a>
                            </li>
                            <li class="link">
                                <a href="classes/NativeTransfer.html" data-type="entity-link" >NativeTransfer</a>
                            </li>
                            <li class="link">
                                <a href="classes/NftTransfer.html" data-type="entity-link" >NftTransfer</a>
                            </li>
                            <li class="link">
                                <a href="classes/RelayDto.html" data-type="entity-link" >RelayDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ScannerService.html" data-type="entity-link" >ScannerService</a>
                            </li>
                            <li class="link">
                                <a href="classes/ScannerStatusService.html" data-type="entity-link" >ScannerStatusService</a>
                            </li>
                            <li class="link">
                                <a href="classes/SmartWalletsAuthDto.html" data-type="entity-link" >SmartWalletsAuthDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StakeDto.html" data-type="entity-link" >StakeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StakeTokens.html" data-type="entity-link" >StakeTokens</a>
                            </li>
                            <li class="link">
                                <a href="classes/SubmitQuestionnaireDto.html" data-type="entity-link" >SubmitQuestionnaireDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SwapTokens.html" data-type="entity-link" >SwapTokens</a>
                            </li>
                            <li class="link">
                                <a href="classes/TokenReceive.html" data-type="entity-link" >TokenReceive</a>
                            </li>
                            <li class="link">
                                <a href="classes/TokenTransferWebhookDto.html" data-type="entity-link" >TokenTransferWebhookDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TransferToken.html" data-type="entity-link" >TransferToken</a>
                            </li>
                            <li class="link">
                                <a href="classes/TransferTokensDto.html" data-type="entity-link" >TransferTokensDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TransferTokensEthereumDto.html" data-type="entity-link" >TransferTokensEthereumDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UnstakeDto.html" data-type="entity-link" >UnstakeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UnstakeTokens.html" data-type="entity-link" >UnstakeTokens</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateProjectDto.html" data-type="entity-link" >UpdateProjectDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateWebhookDto.html" data-type="entity-link" >UpdateWebhookDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/WalletAction.html" data-type="entity-link" >WalletAction</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AnalyticsService.html" data-type="entity-link" >AnalyticsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ApiKeysService.html" data-type="entity-link" >ApiKeysService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ApiKeysService-1.html" data-type="entity-link" >ApiKeysService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AppStoreService.html" data-type="entity-link" >AppStoreService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BackendWalletsEthereumService.html" data-type="entity-link" >BackendWalletsEthereumService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BroadcasterService.html" data-type="entity-link" >BroadcasterService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BundlerApiInterceptor.html" data-type="entity-link" >BundlerApiInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChargeApiService.html" data-type="entity-link" >ChargeApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChargeApiServiceService.html" data-type="entity-link" >ChargeApiServiceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChargeAppsServiceService.html" data-type="entity-link" >ChargeAppsServiceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChargeRelayServiceService.html" data-type="entity-link" >ChargeRelayServiceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConsensusApiService.html" data-type="entity-link" >ConsensusApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConsensusService.html" data-type="entity-link" >ConsensusService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DataLayerService.html" data-type="entity-link" >DataLayerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ERC20EventsScannerService.html" data-type="entity-link" >ERC20EventsScannerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EthereumPaymentsService.html" data-type="entity-link" >EthereumPaymentsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EventsScannerService.html" data-type="entity-link" >EventsScannerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExplorerApiInterceptor.html" data-type="entity-link" >ExplorerApiInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FuseLiquidStakingService.html" data-type="entity-link" >FuseLiquidStakingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GasService.html" data-type="entity-link" >GasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GraphqlAPIService.html" data-type="entity-link" >GraphqlAPIService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GraphQLService.html" data-type="entity-link" >GraphQLService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GraphService.html" data-type="entity-link" >GraphService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy-1.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LegacyApiInterceptor.html" data-type="entity-link" >LegacyApiInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationsService.html" data-type="entity-link" >NotificationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OperatorJwtStrategy.html" data-type="entity-link" >OperatorJwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OperatorsService.html" data-type="entity-link" >OperatorsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaymasterApiService.html" data-type="entity-link" >PaymasterApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaymasterService.html" data-type="entity-link" >PaymasterService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaymentsService.html" data-type="entity-link" >PaymentsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProjectsService.html" data-type="entity-link" >ProjectsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RelayAccountsService.html" data-type="entity-link" >RelayAccountsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RelayAPIService.html" data-type="entity-link" >RelayAPIService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SmartWalletsAAEventsService.html" data-type="entity-link" >SmartWalletsAAEventsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SmartWalletsAAService.html" data-type="entity-link" >SmartWalletsAAService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SmartWalletsAPIService.html" data-type="entity-link" >SmartWalletsAPIService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SmartWalletsEventsService.html" data-type="entity-link" >SmartWalletsEventsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SmartWalletsLegacyService.html" data-type="entity-link" >SmartWalletsLegacyService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StakingAPIService.html" data-type="entity-link" >StakingAPIService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StakingService.html" data-type="entity-link" >StakingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StudioLegacyJwtService.html" data-type="entity-link" >StudioLegacyJwtService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TokenService.html" data-type="entity-link" >TokenService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TradeService.html" data-type="entity-link" >TradeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TransactionsScannerService.html" data-type="entity-link" >TransactionsScannerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserOpEventsScannerService.html" data-type="entity-link" >UserOpEventsScannerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserOpFactory.html" data-type="entity-link" >UserOpFactory</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserOpParser.html" data-type="entity-link" >UserOpParser</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserOpParser-1.html" data-type="entity-link" >UserOpParser</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService.html" data-type="entity-link" >UsersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VoltBarService.html" data-type="entity-link" >VoltBarService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WebhookSendService.html" data-type="entity-link" >WebhookSendService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WebhooksService.html" data-type="entity-link" >WebhooksService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/IsAccountOwnerGuard.html" data-type="entity-link" >IsAccountOwnerGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/IsApiKeyProjectMatchGuard.html" data-type="entity-link" >IsApiKeyProjectMatchGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/IsCreatorOwnerGuard.html" data-type="entity-link" >IsCreatorOwnerGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/IsPrdOrSbxKeyGuard.html" data-type="entity-link" >IsPrdOrSbxKeyGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/IsProjectOwnerGuard.html" data-type="entity-link" >IsProjectOwnerGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/IsValidApiKeysGuard.html" data-type="entity-link" >IsValidApiKeysGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/IsValidApiKeysGuard-1.html" data-type="entity-link" >IsValidApiKeysGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/IsValidPublicApiKeyGuard.html" data-type="entity-link" >IsValidPublicApiKeyGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AbstractDecodedEventResult.html" data-type="entity-link" >AbstractDecodedEventResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActivatedApp.html" data-type="entity-link" >ActivatedApp</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiKey.html" data-type="entity-link" >ApiKey</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiKey-1.html" data-type="entity-link" >ApiKey</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Application.html" data-type="entity-link" >Application</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AvailableApp.html" data-type="entity-link" >AvailableApp</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackendWallet.html" data-type="entity-link" >BackendWallet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BaseUserOp.html" data-type="entity-link" >BaseUserOp</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateSecretDto.html" data-type="entity-link" >CreateSecretDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Decoded.html" data-type="entity-link" >Decoded</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DecodedEventResultWithArgNames.html" data-type="entity-link" >DecodedEventResultWithArgNames</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DecodedEventResultWithoutArgNames.html" data-type="entity-link" >DecodedEventResultWithoutArgNames</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DecodeResult.html" data-type="entity-link" >DecodeResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ERC20Transfer.html" data-type="entity-link" >ERC20Transfer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ERC721Transfer.html" data-type="entity-link" >ERC721Transfer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EthereumBackendWallet.html" data-type="entity-link" >EthereumBackendWallet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EthereumPaymentAccount.html" data-type="entity-link" >EthereumPaymentAccount</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EthereumPaymentLink.html" data-type="entity-link" >EthereumPaymentLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventData.html" data-type="entity-link" >EventData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventProps.html" data-type="entity-link" >EventProps</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FourBytesReponseEntry.html" data-type="entity-link" >FourBytesReponseEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FourBytesResponse.html" data-type="entity-link" >FourBytesResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISmartWalletUser.html" data-type="entity-link" >ISmartWalletUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IValidator.html" data-type="entity-link" >IValidator</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LogFilter.html" data-type="entity-link" >LogFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OperatorWallet.html" data-type="entity-link" >OperatorWallet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymasterInfo.html" data-type="entity-link" >PaymasterInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentAccount.html" data-type="entity-link" >PaymentAccount</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentLink.html" data-type="entity-link" >PaymentLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PrdOrSbxKeyRequest.html" data-type="entity-link" >PrdOrSbxKeyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Project.html" data-type="entity-link" >Project</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RelayAccount.html" data-type="entity-link" >RelayAccount</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScannerStatus.html" data-type="entity-link" >ScannerStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SmartContractWallet.html" data-type="entity-link" >SmartContractWallet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SmartWallet.html" data-type="entity-link" >SmartWallet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SmartWalletService.html" data-type="entity-link" >SmartWalletService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StakedToken.html" data-type="entity-link" >StakedToken</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StakingOption.html" data-type="entity-link" >StakingOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StakingProvider.html" data-type="entity-link" >StakingProvider</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Token.html" data-type="entity-link" >Token</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Token-1.html" data-type="entity-link" >Token</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TokenEventData.html" data-type="entity-link" >TokenEventData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TokenInfo.html" data-type="entity-link" >TokenInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TokenInfoCache.html" data-type="entity-link" >TokenInfoCache</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserOp.html" data-type="entity-link" >UserOp</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserOpEventData.html" data-type="entity-link" >UserOpEventData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserStakedTokens.html" data-type="entity-link" >UserStakedTokens</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WalletActionDocument.html" data-type="entity-link" >WalletActionDocument</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WalletActionInterface.html" data-type="entity-link" >WalletActionInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Webhook.html" data-type="entity-link" >Webhook</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WebhookAddress.html" data-type="entity-link" >WebhookAddress</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WebhookEvent.html" data-type="entity-link" >WebhookEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WebhookEvent-1.html" data-type="entity-link" >WebhookEvent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});