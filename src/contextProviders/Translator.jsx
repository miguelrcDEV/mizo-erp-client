import React from 'react';
import { gql } from 'apollo-boost';
import { useApolloClient } from '@apollo/react-hooks';
import { execute } from '../utils/graphql';
import Loading from '../components/Segments/Loading';
const TranslatorContext = React.createContext({
    translations: []
});

export { TranslatorContext };

function getBrowserLanguage(){
    return navigator.language || navigator.userLanguage;
}


const Translator = ({children}) => {
    const browserLanguage = getBrowserLanguage();
    const client = useApolloClient();
    const [loading, setLoading] = React.useState(false);
    const [language, setLanguage] = React.useState(browserLanguage);
    const [translations, setTranslations] = React.useState({});

    const getTranslations = async(language) => {
        const query = gql`
            query translations($language: Languages!){
                translations(language:$language){
                    label
                    ${language}
                }
            }
        `;
        
        const params = {
            language: language
        };
        
        const response = await execute(client, "query", query, params);
        const translationsArray = response.data.translations;
        let translations = {};

        translationsArray.forEach(translation => {
            translations[translation.label] = translation[language];
        });

        return translations;
    };

    const updateLanguage = (newLanguage) => {
        const sessionStorageLanguage = sessionStorage.getItem('language')
        if(newLanguage !== sessionStorageLanguage){
            setLanguage(newLanguage);
            sessionStorage.setItem('language', newLanguage);
        }
    }

    const loadTranslations = async () => {
        try {
            setLoading(true);
            const updatedTranslations = await getTranslations(language);
            sessionStorage.setItem('language', language);
            setTranslations(updatedTranslations);
            setLoading(false); 
        } catch (error) {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadTranslations();
    },[language]);

    return(
        <>
            {loading ?
                    <Loading />
                :
                    <TranslatorContext.Provider 
                        value={{
                            language: language,
                            loading: loading,
                            translations: translations,
                            updateLanguage: updateLanguage
                        }}
                    >
                        {children}
                    </TranslatorContext.Provider>
            }
        </>
    )
}
export default Translator;