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
                    <a href="index.html" data-type="index-link">backend-api documentation</a>
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
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-AuthModule-1bac22b888651dcefcd93790d55fbbb172019ad36f115a4795ef2aea649117de00a1edf24115750a171b7cb812a10cbc58fe080b07dc45a47c35173fcb6b89fe"' : 'data-target="#xs-controllers-links-module-AuthModule-1bac22b888651dcefcd93790d55fbbb172019ad36f115a4795ef2aea649117de00a1edf24115750a171b7cb812a10cbc58fe080b07dc45a47c35173fcb6b89fe"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-1bac22b888651dcefcd93790d55fbbb172019ad36f115a4795ef2aea649117de00a1edf24115750a171b7cb812a10cbc58fe080b07dc45a47c35173fcb6b89fe"' :
                                            'id="xs-controllers-links-module-AuthModule-1bac22b888651dcefcd93790d55fbbb172019ad36f115a4795ef2aea649117de00a1edf24115750a171b7cb812a10cbc58fe080b07dc45a47c35173fcb6b89fe"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AuthModule-1bac22b888651dcefcd93790d55fbbb172019ad36f115a4795ef2aea649117de00a1edf24115750a171b7cb812a10cbc58fe080b07dc45a47c35173fcb6b89fe"' : 'data-target="#xs-injectables-links-module-AuthModule-1bac22b888651dcefcd93790d55fbbb172019ad36f115a4795ef2aea649117de00a1edf24115750a171b7cb812a10cbc58fe080b07dc45a47c35173fcb6b89fe"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-1bac22b888651dcefcd93790d55fbbb172019ad36f115a4795ef2aea649117de00a1edf24115750a171b7cb812a10cbc58fe080b07dc45a47c35173fcb6b89fe"' :
                                        'id="xs-injectables-links-module-AuthModule-1bac22b888651dcefcd93790d55fbbb172019ad36f115a4795ef2aea649117de00a1edf24115750a171b7cb812a10cbc58fe080b07dc45a47c35173fcb6b89fe"' }>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ProjectsModule.html" data-type="entity-link" >ProjectsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-ProjectsModule-53d14385de39c38e6bbbd3721716a73d55a7ca642a762e4c8d3756c9b6c0ef1ae87a08b477576ad0a2e5590c08f7cc5d0ecd71c6fb7a9b9db262623dc189c936"' : 'data-target="#xs-controllers-links-module-ProjectsModule-53d14385de39c38e6bbbd3721716a73d55a7ca642a762e4c8d3756c9b6c0ef1ae87a08b477576ad0a2e5590c08f7cc5d0ecd71c6fb7a9b9db262623dc189c936"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProjectsModule-53d14385de39c38e6bbbd3721716a73d55a7ca642a762e4c8d3756c9b6c0ef1ae87a08b477576ad0a2e5590c08f7cc5d0ecd71c6fb7a9b9db262623dc189c936"' :
                                            'id="xs-controllers-links-module-ProjectsModule-53d14385de39c38e6bbbd3721716a73d55a7ca642a762e4c8d3756c9b6c0ef1ae87a08b477576ad0a2e5590c08f7cc5d0ecd71c6fb7a9b9db262623dc189c936"' }>
                                            <li class="link">
                                                <a href="controllers/ProjectsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-ProjectsModule-53d14385de39c38e6bbbd3721716a73d55a7ca642a762e4c8d3756c9b6c0ef1ae87a08b477576ad0a2e5590c08f7cc5d0ecd71c6fb7a9b9db262623dc189c936"' : 'data-target="#xs-injectables-links-module-ProjectsModule-53d14385de39c38e6bbbd3721716a73d55a7ca642a762e4c8d3756c9b6c0ef1ae87a08b477576ad0a2e5590c08f7cc5d0ecd71c6fb7a9b9db262623dc189c936"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProjectsModule-53d14385de39c38e6bbbd3721716a73d55a7ca642a762e4c8d3756c9b6c0ef1ae87a08b477576ad0a2e5590c08f7cc5d0ecd71c6fb7a9b9db262623dc189c936"' :
                                        'id="xs-injectables-links-module-ProjectsModule-53d14385de39c38e6bbbd3721716a73d55a7ca642a762e4c8d3756c9b6c0ef1ae87a08b477576ad0a2e5590c08f7cc5d0ecd71c6fb7a9b9db262623dc189c936"' }>
                                        <li class="link">
                                            <a href="injectables/ProjectsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-UsersModule-d20bef1db182a9fac7f0b372232ec8614bdc17f7be0622defff20168c6dee2246ec182dc9cedd08b175ed5a85c625bb32a20f9b133bf07007809e52624ac251d"' : 'data-target="#xs-controllers-links-module-UsersModule-d20bef1db182a9fac7f0b372232ec8614bdc17f7be0622defff20168c6dee2246ec182dc9cedd08b175ed5a85c625bb32a20f9b133bf07007809e52624ac251d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-d20bef1db182a9fac7f0b372232ec8614bdc17f7be0622defff20168c6dee2246ec182dc9cedd08b175ed5a85c625bb32a20f9b133bf07007809e52624ac251d"' :
                                            'id="xs-controllers-links-module-UsersModule-d20bef1db182a9fac7f0b372232ec8614bdc17f7be0622defff20168c6dee2246ec182dc9cedd08b175ed5a85c625bb32a20f9b133bf07007809e52624ac251d"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-UsersModule-d20bef1db182a9fac7f0b372232ec8614bdc17f7be0622defff20168c6dee2246ec182dc9cedd08b175ed5a85c625bb32a20f9b133bf07007809e52624ac251d"' : 'data-target="#xs-injectables-links-module-UsersModule-d20bef1db182a9fac7f0b372232ec8614bdc17f7be0622defff20168c6dee2246ec182dc9cedd08b175ed5a85c625bb32a20f9b133bf07007809e52624ac251d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-d20bef1db182a9fac7f0b372232ec8614bdc17f7be0622defff20168c6dee2246ec182dc9cedd08b175ed5a85c625bb32a20f9b133bf07007809e52624ac251d"' :
                                        'id="xs-injectables-links-module-UsersModule-d20bef1db182a9fac7f0b372232ec8614bdc17f7be0622defff20168c6dee2246ec182dc9cedd08b175ed5a85c625bb32a20f9b133bf07007809e52624ac251d"' }>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CreateProjectDto.html" data-type="entity-link" >CreateProjectDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SubmitQuestionnaireDto.html" data-type="entity-link" >SubmitQuestionnaireDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateProjectDto.html" data-type="entity-link" >UpdateProjectDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/IsAccountOwnerGuard.html" data-type="entity-link" >IsAccountOwnerGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/IsCreatorOwnerGuard.html" data-type="entity-link" >IsCreatorOwnerGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/IsProjectOwnerGuard.html" data-type="entity-link" >IsProjectOwnerGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Project.html" data-type="entity-link" >Project</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
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
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});