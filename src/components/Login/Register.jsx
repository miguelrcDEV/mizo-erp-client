import React from 'react';
import { Paper, FormControl, InputLabel, Select, Grid, Button, Input, InputAdornment, FormHelperText, CircularProgress, IconButton, makeStyles } from '@material-ui/core';
import { useApolloClient } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import jwt_decode from 'jwt-decode';
import { withRouter } from 'react-router-dom';
import { execute } from '../../utils/graphql';
import { TranslatorContext } from '../../contextProviders/Translator';
import useDisplayBreakpoints from '../../contextProviders/useDisplayBreakpoints';
import { mainCountries, countries } from '../../datasheets/countries';
import { languages } from '../../datasheets/languages';
import { CustomCard, CustomCardHeader, CustomCardBody, CustomCardFooter } from '../../displayComponents/CustomCard';
import { primary, tertiary, error } from '../../styles/colors';
import * as mainStyles from '../../styles';
import bgImage from '../../assets/fondo.png';
import logoComplete from '../../assets/logo_complete_white.svg';

const useStyles = makeStyles(theme => ({
    ...mainStyles,
    mainPaperContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `url(${bgImage})`, 
        backgroundRepeat: 'no-repeat', 
        backgroundSize: 'cover'
    },
    formPaper: {
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        minWidth: '400px'
    },
    formContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: '20px',
        marginBottom: '20px'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    link: {
        color: primary,
        cursor: 'pointer'
    }
}));

const Register = ({history}) => {
    const classes = useStyles();
    const client = useApolloClient();
    const { translations } = React.useContext(TranslatorContext);
    const [password, setPassword] = React.useState('');
    const [passwordRepeated, setPasswordRepeated] = React.useState('');
    const [registerFailed, setRegisterFailed] = React.useState();
    const [errorEmptyPassword, setErrorEmptyPassword] = React.useState(false);
    const [errorEmptyPasswordRepeated, setErrorEmptyPasswordRepeated] = React.useState(false);
    const [validPassword, setValidPassword] = React.useState(true);
    const [validPasswordRepeated, setValidPasswordRepeated] = React.useState(true);
    const [showPassword, setShowPassword] = React.useState(true);
    const [showPasswordRepeated, setShowPasswordRepeated] = React.useState(true);
    const [passwordsMatch, setPasswordsMatch] = React.useState(true);
    const [registering, setRegistering] = React.useState(false);

    const handleChangePassword = event => {
        const newPassword = event.target.value;
        const isValidPassword = newPassword.length >= 8;
        setValidPassword(isValidPassword);
        setPassword(newPassword);
    };

    const handleChangePasswordRepeated = event => {
        const newPassword = event.target.value;
        const isValidPassword = newPassword.length >= 8;
        setValidPasswordRepeated(isValidPassword);
        setPasswordRepeated(newPassword);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowPasswordRepeated = () => {
        setShowPasswordRepeated(!showPasswordRepeated);
    };

    const handleMouseDownPassword = event => {
        event.preventDefault();
    };

    const handleEnterKey = event => {
        if (event.nativeEvent.keyCode === 13) {
            register();
            event.preventDefault();
        }
    };

    const register = async() => {
        const hasErrors = checkErrors();

        /* if(!hasErrors){
            try {
                setRegistering(true);
                const mutation = gql`
                    mutation register(
                        $registerInfo: RegisterInfo!
                    ) {
                        register(
                            registerInfo:$registerInfo
                        ) {
                            token
                        }
                    }
                `;
                let variables = {
                    registerInfo: {
                        name: name,
                        surname: surname,
                        email: email,
                        password: password,
                        language: language,
                        companyName: companyName,
                        phone: phone,
                        country: country,
                        address: address
                    }
                };

                const response = await execute(client, "mutation", mutation, variables);

                if(!!response && !!response.data && !!response.data.register && !!response.data.register.token){
                    const token = response.data.register.token;
                    sessionStorage.setItem("token", token);
                    setErrorAlreadyRegisteredEmail(false);
                    setRegistering(false);
                    let decodedToken = jwt_decode(response.data.register.token);
                    history.replace(`/dashboard/${decodedToken.employee.id}`);
                }
                else{
                    setRegistering(false);
                    setRegisterFailed(true);
                }
            } catch (error) {
                setRegistering(false);
                if(error.includes("Email already registered")){
                    setErrorAlreadyRegisteredEmail(true);
                }
                else{
                    setRegisterFailed(true);
                }
            }
            
        } */
    }

    const checkErrors = () => {
        let hasErrors = false;

        const isEmptyPassword = (!password || password === "" || password === null) ? true : false;
        const isEmptyPasswordRepeated = (!passwordRepeated || passwordRepeated === "" || passwordRepeated === null) ? true : false;
        const matchNewPwd = password === passwordRepeated;

        if(!isEmptyPassword && !isEmptyPasswordRepeated){
            setPasswordsMatch(matchNewPwd);
        }

        setErrorEmptyPassword(isEmptyPassword);
        setErrorEmptyPasswordRepeated(isEmptyPasswordRepeated);

        hasErrors = isEmptyPassword || isEmptyPasswordRepeated || !validPassword || !validPasswordRepeated || !matchNewPwd;

        return hasErrors;
    };

    return(
        <Paper className={classes.mainPaperContainer} square={true}>
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div
                    style={{
                        height: '100px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <img alt="mizo-erp-logo-complete" src={logoComplete} style={{maxWidth: '200px'}} />
                </div>

                <div
                    style={{
                        height: 'calc(100% - 100px)',
                        width: '100%',
                        display: 'flex'
                    }}
                >
                    <div className={classes.centered}>
                        <div 
                            style={{
                                height: 'calc(100% - 100px)',
                                padding: '10px'
                            }}
                        >
                            <CustomCard style={{maxWidth: "800px", maxHeight: '100%', marginTop: '35px', marginBottom: '35px'}}>
                                <CustomCardHeader color="primary" textColor="white">
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            fontSize: '30px'
                                        }}
                                    >
                                        {translations.signUp}
                                    </div>
                                </CustomCardHeader>
                                <CustomCardBody
                                    style={{height: '100%', overflowY: 'auto'}}
                                >
                                    <Grid container spacing={1}>
                                        <Grid item xs={12} sm={6} md={6}>
                                            <FormControl fullWidth={true}>
                                                <InputLabel htmlFor="adornment-newpassword">
                                                    {translations.newPassword}
                                                </InputLabel>
                                                <Input
                                                    id="adornment-newpassword"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={handleChangePassword}
                                                    error={errorEmptyPassword || !validPassword}
                                                    onKeyPress={handleEnterKey}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowPassword}
                                                                onMouseDown={handleMouseDownPassword}
                                                            >
                                                                {showPassword ? 
                                                                        <i className="far fa-eye"></i>
                                                                    : 
                                                                        <i className="far fa-eye-slash"></i>
                                                                }
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                />
                                                {!validPassword &&
                                                    <FormHelperText id="invalid-email-helper-text">{translations.passwordMinLength}</FormHelperText>
                                                }
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={6}>
                                            <FormControl fullWidth={true}>
                                                <InputLabel htmlFor="adornment-newpasswordrepeat">
                                                    {translations.newPasswordRepeated}
                                                </InputLabel>
                                                <Input
                                                    id="adornment-newpasswordrepeat"
                                                    type={showPasswordRepeated ? 'text' : 'password'}
                                                    value={passwordRepeated}
                                                    onChange={handleChangePasswordRepeated}
                                                    error={errorEmptyPasswordRepeated || !validPasswordRepeated}
                                                    onKeyPress={handleEnterKey}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowPasswordRepeated}
                                                                onMouseDown={handleMouseDownPassword}
                                                            >
                                                                {showPasswordRepeated ? 
                                                                        <i className="far fa-eye"></i>
                                                                    : 
                                                                        <i className="far fa-eye-slash"></i>
                                                                }
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                />
                                                {!validPasswordRepeated &&
                                                    <FormHelperText id="invalid-email-helper-text">{translations.passwordMinLength}</FormHelperText>
                                                }
                                            </FormControl>
                                        </Grid>
                                    </Grid> 
                                </CustomCardBody>
                                <CustomCardFooter
                                    style={{
                                        height: '70px', 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {!passwordsMatch &&
                                        <div
                                            style={{
                                                marginBottom: '10px',
                                                color: error
                                            }}
                                        >
                                            {translations.passwordsDontMatch}
                                        </div>
                                    }

                                    {registerFailed &&
                                        <div
                                            style={{
                                                marginBottom: '10px',
                                                color: error
                                            }}
                                        >
                                            {translations.signUpFailed}
                                        </div>
                                    }

                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        onClick={register}
                                        disabled={registering}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection:' row',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {translations.startNow}
                                            {registering &&
                                                <div style={{marginLeft: '6px', display: 'flex', alignItems: 'center'}}>
                                                    <CircularProgress size={20} color="secondary" />
                                                </div>
                                            }
                                        </div>
                                    </Button>
                                </CustomCardFooter>
                            </CustomCard>
                        </div>
                    </div>
                </div>
            </div>
        </Paper>
    )
};

export default withRouter(Register);